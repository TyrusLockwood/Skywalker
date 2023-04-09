import { createStore } from 'vuex'

export default createStore({
  state: {
    fontSize: 'normal'
  },
  mutations: {
    setfontSize (state, val) {
      state.fontSize = val
    }
  },
  actions: {
    // 废弃vuex 通过主进程下发即可 没必要全局管理
    changefontSize (context, val) {
      context.commit('setfontSize', val)
    }
  }
})
