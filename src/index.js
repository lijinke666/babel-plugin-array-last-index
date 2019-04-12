const babel = require('@babel/core')
const t = require('@babel/types')

const visitor = {
  MemberExpression(path) {
    const node = path.node
    let arrName;
    let arrIndex;
    let operator;
    if (node.object && t.isIdentifier(node.object)) {
      arrName = node.object.name
    }
    if(node.property && t.isUnaryExpression(node.property)){
      if(
        node.property.prefix && 
        node.property.operator && 
        node.property.argument && 
        t.isNumericLiteral(node.property.argument)
      ) {
        arrIndex = node.property.argument.value
        operator = node.property.operator
      }
    }

    // 排除直接是表达式 arr[-1] = 2 的这种情况
    if(
      arrName && 
      arrIndex && 
      operator && 
      path.parentPath && 
      path.parentPath.node && 
      !t.isAssignmentExpression(path.parentPath.node)
    ) {
      const result = `[${arrName}.length ${operator} ${arrIndex}]`
      path.replaceWithSourceString(result)
    }
  },
  AssignmentExpression(path){
    // 表达式 arr[-1] = 2
    const node = path.node
    console.log('node: ', node.left);
    // path.replaceWithSourceString('string')
  }
}

module.exports = (babel) => {
  return {
    visitor
  }
}
