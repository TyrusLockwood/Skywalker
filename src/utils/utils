// 格式化日期
const dateFormatter = (_fmt, _d) => {
  const date = _d ? new Date(_d) : new Date()
  const year = date.getFullYear() + ''
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minutes = date.getMinutes()
  const second = date.getSeconds()

  return _fmt.replace(/YYYY|yyyy/g, year)
    .replace(/YY|yy/g, year.substr(2, 2))
    .replace(/MM/g, (month < 10 ? '0' : '') + month)
    .replace(/DD/g, (day < 10 ? '0' : '') + day)
    .replace(/HH|hh/g, (hour < 10 ? '0' : '') + hour)
    .replace(/mm/g, (minutes < 10 ? '0' : '') + minutes)
    .replace(/ss/g, (second < 10 ? '0' : '') + second)
}

// 时间间隔
const periodTime = (_t) => {
  // 把时间转换为时间戳
  const d = Date.parse(_t.replace(/-/gi, '/'))
  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  const year = month * 12

  // 获取当前时间戳
  const now = new Date().getTime()
  const diffValue = now - d

  if (diffValue < 0) return

  let _r = null

  if (diffValue / year >= 1) {
    _r = parseInt(diffValue / year) + '年前'
  } else if (diffValue / month >= 1) {
    _r = parseInt(diffValue / month) + '个月前'
  } else if (diffValue / (7 * day) >= 1) {
    _r = parseInt(diffValue / (7 * day)) + '周前'
  } else if (diffValue / day >= 1) {
    _r = parseInt(diffValue / day) + '天前'
  } else if (diffValue / hour >= 1) {
    _r = parseInt(diffValue / hour) + '小时前'
  } else if (diffValue / minute >= 1) {
    _r = parseInt(diffValue / minute) + '分钟前'
  } else {
    _r = '刚刚'
  }

  return _r
}

module.exports = {
  dateFormatter,
  periodTime
}
