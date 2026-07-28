# Cargo Build & Test

This workflow runs on every push and pull request to verify code quality and run all tests.

## Jobs

### build

Runs on `ubuntu-latest`:

1. **Checkout code** - Gets the latest code from the repository
2. **Set up Rust** - Installs Rust stable with clippy and rustfmt components
3. **Cache dependencies** - Caches Cargo dependencies for faster builds
4. **Build** - Compiles the project with verbose output
5. **Run clippy** - Static analysis with warnings denied as errors
6. **Run tests** - Executes all unit and integration tests
7. **Format check** - Verifies code follows Rust style guidelines

## Environment

- **OS**: Ubuntu 22.04 (latest)
- **Rust**: Stable channel
- **MongoDB**: 7.0 (for integration tests)

## Test Coverage

| Test Type | Command | Description |
|-----------|---------|-------------|
| Library | `cargo test --lib` | Unit tests for library code |
| Binaries | `cargo test --bins` | Unit tests for binaries |
| Integration | `cargo test --test integration` | Integration tests with MongoDB |

## Quality Gates

All jobs must pass for the workflow to succeed:

- ✅ Build completes without errors
- ✅ Clippy passes with no warnings
- ✅ All tests pass
- ✅ Code is properly formatted

## Local Development

Before committing, run locally:

```bash
cargo build
cargo clippy -- -D warnings
cargo test
cargo fmt --check
```

## Troubleshooting

### Build Fails

- Clear cache: `rm -rf target`
- Update Rust: `rustup update`
- Check dependencies: `cargo tree`

### Tests Fail

- Ensure Docker is running for integration tests
- Check MongoDB container: `docker ps`
- Verify test fixtures: `ls tests/fixtures/*/*.json`

### Clippy Warnings

- Run with fixes: `cargo clippy --fix -- -D warnings`
- Review warnings: `cargo clippy -- -D warnings`
