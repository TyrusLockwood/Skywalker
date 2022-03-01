import { createStore } from 'vuex'

export default createStore({
  state: {
    clipActive: 0,
    usuallyActive: 0
  },
  mutations: {
    setClipActive (state, val) {
      state.clipActive = val
    },
    setUsuallyActive (state, val) {
      state.usuallyActive = val
    }
  },
  actions: {
    changeClipActive (context, val) {
      context.commit('setClipActive', val)
    },
    changeUsuallyActive (context, val) {
      context.commit('setUsuallyActive', val)
    }
  }
})
