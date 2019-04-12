import { transform } from '@babel/core'
import babelArrayLastValuePlugin from '../src/index'

describe('test array last value babel plugin', () => {
  beforeEach(()=>{
    String.prototype.trimAll = function(){
      return this.replace(/\s/g,"")
    }
  })
  it('test-1', () => {
    const _code = `
      const arr = [1,2,3];
      const v = arr[-1];
    `
    const { code } = transform(_code, {
      plugins: [babelArrayLastValuePlugin]
    })

    expect(code.trimAll()).toEqual(`const arr = [1,2,3];const v = [arr.length - 1];`.trimAll())
  })
})
