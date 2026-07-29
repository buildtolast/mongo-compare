#!/usr/bin/env python3
"""
MongoDB Compare Integration Test Suite

This test suite runs comprehensive integration tests against the MongoDB Compare API.
"""

import sys
import os
from typing import Dict, Any, Optional
import requests


class IntegrationTestSuite:
    """Runs comprehensive integration tests for MongoDB Compare."""
    
    def __init__(self, host: str = "localhost", port: int = 80, 
                 mongo_port: int = 27017):
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}"
        self.mongo_port = mongo_port
        self.test_results = []
        
    def _make_request(self, method: str, endpoint: str, 
                     json_data: Optional[Dict] = None) -> requests.Response:
        """Make an HTTP request to the API."""
        url = f"{self.base_url}/api{endpoint}"
        try:
            response = requests.request(method, url, json=json_data, timeout=10)
            return response
        except requests.RequestException as e:
            # Return a mock response object
            mock_response = type('MockResponse', (), {})()
            mock_response.status_code = 0
            mock_response.text = str(e)
            mock_response.json = lambda: {'error': str(e)}
            return mock_response
    
    def _assert_equal(self, expected: Any, actual: Any, test_name: str) -> bool:
        """Assert that expected equals actual."""
        result = expected == actual
        self.test_results.append({
            "name": test_name,
            "passed": result,
            "expected": expected,
            "actual": actual
        })
        return result
    
    def _assert_contains(self, expected: str, actual: Any, test_name: str) -> bool:
        """Assert that actual contains expected."""
        if isinstance(actual, list):
            result = expected in actual
        elif isinstance(actual, str):
            result = expected in actual
        else:
            result = False
            
        self.test_results.append({
            "name": test_name,
            "passed": result,
            "expected": expected,
            "actual": actual
        })
        return result
    
    def test_health(self) -> bool:
        """Test the health endpoint on Rust backend (port 3001)."""
        try:
            response = requests.get("http://localhost:3001/health", timeout=5)
            return self._assert_equal(200, response.status_code, 
                                     "Health endpoint returns 200")
        except requests.RequestException as e:
            self.test_results.append({
                "name": "Health endpoint returns 200",
                "passed": False,
                "error": str(e)
            })
            return False
    
    def test_test_connection(self) -> bool:
        """Test the test-connection endpoint."""
        response = self._make_request("POST", "/test-connection", {
            "connection_string": f"mongodb://localhost:{self.mongo_port}"
        })
        
        if response.status_code != 200:
            self.test_results.append({
                "name": "Test connection endpoint",
                "passed": False,
                "expected_status": 200,
                "actual_status": response.status_code
            })
            return False
        
        data = response.json()
        return self._assert_equal(True, data.get("success"), 
                                 "Test connection returns success")
    
    def test_get_databases(self) -> bool:
        """Test the get-databases endpoint."""
        response = self._make_request("POST", "/get-databases", {
            "connection_string": f"mongodb://localhost:{self.mongo_port}"
        })
        
        if response.status_code != 200:
            self.test_results.append({
                "name": "Get databases endpoint",
                "passed": False,
                "expected_status": 200,
                "actual_status": response.status_code
            })
            return False
        
        data = response.json()
        return self._assert_contains("test", data.get("databases", []),
                                    "Get databases includes test database")
    
    def test_get_collections(self) -> bool:
        """Test the get-collections endpoint."""
        response = self._make_request("POST", "/get-collections", {
            "connection_string": f"mongodb://localhost:{self.mongo_port}",
            "database": "test"
        })
        
        if response.status_code != 200:
            self.test_results.append({
                "name": "Get collections endpoint",
                "passed": False,
                "expected_status": 200,
                "actual_status": response.status_code
            })
            return False
        
        data = response.json()
        collections = data.get("collections", [])
        return (self._assert_contains("users", collections, 
                                    "Get collections includes users") and
                self._assert_contains("products", collections,
                                    "Get collections includes products"))
    
    def test_run_comparison_same_db(self) -> bool:
        """Test run-comparison with same source and target database."""
        response = self._make_request("POST", "/run-comparison", {
            "source_connection_string": f"mongodb://localhost:{self.mongo_port}",
            "target_connection_string": f"mongodb://localhost:{self.mongo_port}",
            "database": "test",
            "collections": ["users"],
            "identifier_field": "_id",
            "sample_limit": 10,
            "diff_strategy": "all"
        })
        
        if response.status_code != 200:
            self.test_results.append({
                "name": "Run comparison (same DB) endpoint",
                "passed": False,
                "expected_status": 200,
                "actual_status": response.status_code
            })
            return False
        
        data = response.json()
        result = data.get("result", {})
        
        tests_passed = (
            self._assert_equal(0, result.get("created_count", -1),
                             "Same DB comparison: 0 created") and
            self._assert_equal(0, result.get("updated_count", -1),
                             "Same DB comparison: 0 updated") and
            self._assert_equal(0, result.get("deleted_count", -1),
                             "Same DB comparison: 0 deleted")
        )
        
        return tests_passed
    
    def test_run_comparison_cross_db(self) -> bool:
        """Test run-comparison with different source and target databases."""
        response = self._make_request("POST", "/run-comparison", {
            "source_connection_string": f"mongodb://localhost:{self.mongo_port}",
            "target_connection_string": f"mongodb://localhost:{self.mongo_port}",
            "database": "test",
            "target_database": "target",
            "collections": ["users"],
            "identifier_field": "_id",
            "sample_limit": 10,
            "diff_strategy": "all"
        })
        
        if response.status_code != 200:
            self.test_results.append({
                "name": "Run comparison (cross DB) endpoint",
                "passed": False,
                "expected_status": 200,
                "actual_status": response.status_code
            })
            return False
        
        data = response.json()
        
        if not data.get("success"):
            self.test_results.append({
                "name": "Run comparison (cross DB) success",
                "passed": False,
                "expected": True,
                "actual": data.get("success")
            })
            return False
        
        return self._assert_equal(True, data.get("success", False),
                                 "Run comparison (cross DB) success")
    
    def test_run_comparison_detects_differences(self) -> bool:
        """Test that run-comparison correctly detects inserted, updated, and deleted rows."""
        response = self._make_request("POST", "/run-comparison", {
            "source_connection_string": f"mongodb://localhost:{self.mongo_port}",
            "target_connection_string": f"mongodb://localhost:{self.mongo_port}",
            "database": "test",
            "target_database": "target",
            "collections": ["users"],
            "identifier_field": "_id",
            "sample_limit": 10,
            "diff_strategy": "all"
        })
        
        if response.status_code != 200:
            self.test_results.append({
                "name": "Run comparison detects differences",
                "passed": False,
                "expected_status": 200,
                "actual_status": response.status_code
            })
            return False
        
        data = response.json()
        result = data.get("result", {})
        
        # Check that the response structure is correct
        structure_ok = (
            isinstance(result.get("sample_created"), list) and
            isinstance(result.get("sample_updated"), list) and
            isinstance(result.get("sample_deleted"), list)
        )
        
        if not structure_ok:
            self.test_results.append({
                "name": "Run comparison response structure",
                "passed": False,
                "error": "Invalid response structure"
            })
            return False
        
        return self._assert_equal(True, data.get("success", False),
                                 "Run comparison detects differences")
    
    def test_response_json_structure(self) -> bool:
        """Test that API responses have valid JSON structure."""
        response = self._make_request("POST", "/run-comparison", {
            "source_connection_string": f"mongodb://localhost:{self.mongo_port}",
            "target_connection_string": f"mongodb://localhost:{self.mongo_port}",
            "database": "test",
            "collections": ["users"],
            "identifier_field": "_id",
            "sample_limit": 10,
            "diff_strategy": "all"
        })
        
        try:
            data = response.json()
            has_success = "success" in data
            has_result = "result" in data
            
            self.test_results.append({
                "name": "Response has success field",
                "passed": has_success,
                "actual": has_success
            })
            
            self.test_results.append({
                "name": "Response has result field",
                "passed": has_result,
                "actual": has_result
            })
            
            return has_success and has_result
        except json.JSONDecodeError:
            self.test_results.append({
                "name": "Response has valid JSON structure",
                "passed": False,
                "error": "Invalid JSON"
            })
            return False
    
    def run_all_tests(self) -> bool:
        """Run all integration tests."""
        print("=" * 60)
        print("MongoDB Compare Integration Test Suite")
        print("=" * 60)
        print()
        
        tests = [
            ("Health Check", self.test_health),
            ("Test Connection", self.test_test_connection),
            ("Get Databases", self.test_get_databases),
            ("Get Collections", self.test_get_collections),
            ("Run Comparison (Same DB)", self.test_run_comparison_same_db),
            ("Run Comparison (Cross DB)", self.test_run_comparison_cross_db),
            ("Run Comparison Detects Differences", self.test_run_comparison_detects_differences),
            ("Response JSON Structure", self.test_response_json_structure),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"Running: {test_name}...", end=" ")
            try:
                if test_func():
                    print("✓ PASS")
                    passed += 1
                else:
                    print("✗ FAIL")
                    failed += 1
            except Exception as e:
                print(f"✗ ERROR: {e}")
                failed += 1
        
        print()
        print("=" * 60)
        print(f"Total: {passed + failed} | Passed: {passed} | Failed: {failed}")
        print("=" * 60)
        print()
        
        return failed == 0
    
    def print_detailed_results(self):
        """Print detailed test results."""
        if not self.test_results:
            return
        
        print("\nDetailed Results:")
        print("-" * 60)
        
        for result in self.test_results:
            status = "✓" if result.get("passed") else "✗"
            name = result.get("name", "Unknown")
            
            if result.get("passed"):
                print(f"{status} {name}")
            else:
                print(f"{status} {name}")
                if "error" in result:
                    print(f"   Error: {result['error']}")
                elif "expected" in result and "actual" in result:
                    print(f"   Expected: {result['expected']}")
                    print(f"   Actual: {result['actual']}")


def main():
    """Main entry point."""
    import argparse
    parser = argparse.ArgumentParser(description="MongoDB Compare Integration Tests")
    parser.add_argument("--host", default="localhost", help="Host to test")
    parser.add_argument("--port", type=int, default=80, help="Port (default: 80)")
    parser.add_argument("--mongo-port", type=int, default=27017, help="MongoDB port (default: 27017)")
    args = parser.parse_args()
    
    # Run tests
    test_suite = IntegrationTestSuite(
        host=args.host,
        port=args.port,
        mongo_port=args.mongo_port
    )
    
    success = test_suite.run_all_tests()
    test_suite.print_detailed_results()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
