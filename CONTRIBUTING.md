# Contributing to mongo-compare

Thank you for your interest in contributing to mongo-compare! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** and create a local branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Read the Documentation**:
   - Start with `README.md` for an overview
   - Review `CONTEXT.md` to understand domain concepts
   - Check `docs/adr/` for architectural decisions

3. **Run the Tests**:
   ```bash
   cargo test
   ```
   Ensure all tests pass before submitting changes.

## Development Workflow

### Making Changes

1. **Identify the Issue**: Understand what needs to be changed
2. **Plan Your Approach**: Consider how it fits into existing architecture
3. **Write Tests First**: For new features, write tests before implementation (TDD)
4. **Implement**: Make the changes following code style guidelines
5. **Run Tests**: Verify all tests pass
6. **Code Review**: Ensure code follows project standards

### Code Style

- Follow Rust conventions from the `rust-patterns` skill
- Use idiomatic Rust: prefer `if let` over `match` for simple cases, use `?` for error propagation
- Keep functions small and focused
- Use descriptive names for variables, functions, and types
- Add comments for complex logic

### Testing

- **Unit Tests**: Write unit tests for individual functions
- **Integration Tests**: Add integration tests in the `tests/` directory
- **Edge Cases**: Test boundary conditions and error scenarios
- **Documentation**: Include test cases as documentation

Example:
```rust
#[test]
fn test_example() {
    let result = function_under_test(input);
    assert_eq!(result, expected);
}
```

## Submitting Changes

1. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

2. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Open a Pull Request**:
   - Provide a clear description of changes
   - Reference related issues
   - Include screenshots if applicable

## Code Review Guidelines

When reviewing code:

- **Functionality**: Does it do what it's supposed to do?
- **Testing**: Are there adequate tests?
- **Style**: Does it follow Rust conventions?
- **Documentation**: Is the code and documentation clear?
- **Performance**: Are there unnecessary allocations or inefficient algorithms?

## Architecture Decisions

Before making significant architectural changes:

1. **Review ADRs**: Check existing architecture decision records
2. **Discuss with Maintainers**: Get feedback on proposed changes
3. **Justify Changes**: Document why the change is necessary
4. **Consider Alternatives**: Show you've thought about other approaches

## Common Issues to Watch For

- **Breaking Changes**: Ensure backward compatibility when possible
- **Performance**: Profile and optimize if needed
- **Error Handling**: Use `anyhow::Result` appropriately
- **Null Safety**: Be careful with `Option` and `unwrap()`
- **Serialization**: Use `serde` for JSON handling

## Getting Help

- Check existing issues and documentation
- Ask in the project discussions
- Contact maintainers for specific questions

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome diverse contributions and encourage healthy technical discussions.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).