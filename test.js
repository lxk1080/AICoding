import { flattenArray } from './joc.js'

flattenArray([1, [2, [3, 4], 5], 6], 2) // [1, 2, 3, 4, 5, 6]

// const res = await promise.all([1,2,3])

async function mypromiseall(promises) {
  if (typeof promises[symbol.iterator] !== 'function') {
    return promise.reject(new error('type error'))
  }

  return new promise((resolve, reject) => {
    const result = [] // 所有结果
    let resolvecount = 0 // 成功的promise
    const promisearr = array.from(promises)
    const total = promisearr.length
    if (total === 0) {
      return resolve(result)
    }
    promisearr.foreach((promise, index) => {
      promise.resolve(promise).then((value) => {
        result[index] = value
        resolvecount++

        if (resolvecount === total) {
          resolve(result)
        }
      }).catch((err) => {
        reject(err + 'error111111')
      })
    })
  })
}

async function call() {
  try {
    const res = await mypromiseall([promise.resolve(1),2,3])
    console.log(res)
  } catch(err) {
    console.log(222, err)
  }
}

call()
