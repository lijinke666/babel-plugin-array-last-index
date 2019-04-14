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

  // TODO: 优化 只替换表达式之前的
  AssignmentExpression(path){
    // 表达式 arr[-1] = 2
    const node = path.node
    let arrName;
    let arrIndex;
    let operator;
    if(
      node.left &&
      node.left.property &&
      t.isUnaryExpression(node.left.property) &&
      node.left.property.prefix
    ) {
      operator = node.left.property.operator
      if(node.left.property.argument && t.isNumericLiteral(node.left.property.argument)) {
        arrIndex = node.left.property.argument.value
      }
    }
    if (node.left.object && t.isIdentifier(node.left.object)) {
      arrName = node.left.object.name
    }
    
    if(node.right && t.isNumericLiteral(node.right) && arrName && operator && arrIndex) {
      const value = node.right.value
      const result = `${arrName}[${arrName}.length ${operator} ${arrIndex}] = ${value}`
      path.replaceWithSourceString(result)
    }
  },

  CallExpression(path){
    // 支持 lodash get(arr,'[0]')
    // 支持 lodash get(arr,[0])
    const node = path.node
    let result
    if(
      node.callee && 
      t.isIdentifier(node.callee) &&
      node.callee.name === 'get'
    ) {
      const [arrNameNode, arrIndexNode] = node.arguments
      if(t.isIdentifier(arrNameNode)) {
        const arrName = arrNameNode.name
        if(t.isStringLiteral(arrIndexNode)) {
          const arrIndex = arrIndexNode.value.replace('[','').replace(']','')
          result = `get(${arrName}, \`[\$\{${arrName}.length ${arrIndex}\}]\`)`
        }else if(t.isArrayExpression(arrIndexNode)) {
          if(
            arrIndexNode.elements && 
            arrIndexNode.elements.length === 1
            ) {
              const element = arrIndexNode.elements[0]
              if(t.isUnaryExpression(element) && t.isNumericLiteral(element.argument)){
                const operator = element.operator
                const value = element.argument.value
                result = `get(${arrName}, [\`\$\{ ${arrName}.length ${operator} ${value} \}\`])`
              }
          }
        }
      }
    }

    if(result) {
      path.replaceWithSourceString(result)
    }
  }
}

module.exports = (babel) => {
  return {
    visitor
  }
}
