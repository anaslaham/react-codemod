
function transform(fileInfo, api) {
    // Check the file extension
    if (!fileInfo.path.endsWith('.tsx')) {
        return fileInfo.source;
    }
    const j = api.jscodeshift;
    const ast = j(fileInfo.source);
    const arrowFunctions = ast.find(j.ArrowFunctionExpression);

    arrowFunctions.forEach(path => {
        j(path)
            .find(j.CallExpression, {
                callee: {
                    object: {
                        name: 'userEvent'
                    }
                }
            },).forEach(userEventPath => {
                const SurroundingFunction = j(userEventPath).closest(j.ArrowFunctionExpression).nodes()[0]
                SurroundingFunction.async = true;
                // Check if this call expression is already awaited
                if (userEventPath.parentPath.node.type === 'AwaitExpression') {
                    return;
                }

                const { node } = userEventPath;
                j(userEventPath).replaceWith(j.awaitExpression(j.callExpression(node.callee, node.arguments)));
            })
    });

    return ast.toSource();
}

module.exports = transform;
