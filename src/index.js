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

    if(arrName && arrIndex && operator) {
      const result = `[${arrName}.length ${operator} ${arrIndex}]`
      path.replaceWithSourceString(result)
    }

  }
}

module.exports = (babel) => {
  return {
    visitor
  }
}
