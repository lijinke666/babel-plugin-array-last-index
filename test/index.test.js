import { transform } from '@babel/core'
import babelArrayLastValuePlugin from '../src/index'

describe('test array last value babel plugin', () => {
  beforeEach(() => {
    String.prototype.trimAll = function () {
      return this.replace(/\s/g, "")
    }
  })
  it('test expression', () => {
    const _code = `
      const arr = [1,2,3];
      const v = arr[-1];
    `
    const { code } = transform(_code, {
      plugins: [babelArrayLastValuePlugin]
    })

    expect(code.trimAll()).toEqual(`const arr = [1,2,3];const v = arr[arr.length - 1];`.trimAll())
  })
  it('test assignment', () => {
    const _code = `
      const arr = [1,2,3];
      arr[-1] = 2;
    `
    const { code } = transform(_code, {
      plugins: [babelArrayLastValuePlugin]
    })

    expect(code.trimAll()).toEqual(`const arr = [1,2,3];arr[arr.length - 1] = 2;`.trimAll())
  })

  it('should support lodash get & value is string', () => {
    const _code = `
      const arr = [1,2,3];
      get(arr,'[-1]');
    `
    const { code } = transform(_code, {
      plugins: [babelArrayLastValuePlugin]
    })

    expect(code.trimAll()).toEqual(`const arr = [1,2,3];get(arr,\`[\${arr.length-1}]\`);`.trimAll())
  })


  it('should support lodash get & value is number', () => {
    const _code = `
      const arr = [1,2,3];
      get(arr,[-1]);
    `
    const { code } = transform(_code, {
      plugins: [babelArrayLastValuePlugin]
    })

    expect(code.trimAll()).toEqual(`const arr = [1,2,3];get(arr,[\`\${arr.length-1}\`]);`.trimAll())
  })
})
