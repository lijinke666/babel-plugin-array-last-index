const babel = require('@babel/core')
const plugin = require('./index')
const _code = `
  const arr = [1,2,3]
  const v = arr[-1]
  const a = -123
`
const {code} = babel.transform(_code,{
  plugins: [plugin]
})

console.log(code)
