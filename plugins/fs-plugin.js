import { initIce, IceCallback, refcallback, initIceLong } from './ice-client'
import { generateIdentification } from './fingerprint2'
import utils from './commom'

(function () {
  initIce();
  generateIdentification();
}());

// 全局注入
export default ({ app }, inject) => {
  inject('iceCallback', IceCallback)
  inject('refcallback', refcallback)
  inject('initIceLong', initIceLong)
  inject('commom', utils)
}
