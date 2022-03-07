/* 监听copy/enter/esc/left/right事件
*  JavaScript Keyboard Map (Mac layout)
*              esc—— F1——— F2——— F3——— F4——— F5——— F6——— F7——— F8——— F9——— F10—— F11—— F12—— F13—————+
*             |  27 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 |  ???  |
*            ` ——— 1———— 2———— 3———— 4———— 5———— 6———— 7———— 8———— 9———— 0———— - ——— = ——— delete——+
*           | 192 |  49 |  50 |  51 |  52 |  53 |  54 |  55 |  56 |  57 |  58 |  59 |  60 |   61  |
*          tab———— Q———— W———— E———— R———— T———— Y———— U———— I———— O———— P———— [ ——— ] ——— \ ————+
*         |   9   |  81 |  87 |  69 |  82 |  84 |  89 |  85 |  73 |  79 |  80 | 219 | 221 | 220 |
*        caps————— A———— S———— D———— F———— G———— H———— J———— K———— L———— ; ——— ' ——— return————+
*       |    20   |  65 |  83 |  68 |  70 |  71 |  72 |  74 |  75 |  76 | 186 | 222 |   13    |
*      shift—————— Z———— X———— C———— V———— B———— N———— M———— , ——— . ——— / ——— shift—————————+
*     |    16     |  90 |  88 |  67 |  86 |  66 |  78 |  77 | 188 | 190 | 191 |     16      |
*    fn—— ctrl opt— command space—————————————————————————— command opt——+—————up————+—————+
*   |    | 17 | 18 |   91  |            32                 |   93  | 18 |     |  38 |     |
*  +————+————+————+———————+———————————————————————————————+———————+————left——down——right—+
*                                                                     |  37 |  40 |  39 |
*                                                                    +—————+—————+—————+
*/

// Cmd + c || return || space
const cmdCOrReturnOrSpace = e => (e.keyCode === 67 && e.metaKey) || e.keyCode === 13 || e.keyCode === 32

// esc || x
const escOrX = e => e.keyCode === 27 || e.keyCode === 88

// a || left
const aOrLeft = e => e.keyCode === 37 || e.keyCode === 65

// d || right
const dOrRight = e => e.keyCode === 39 || e.keyCode === 68

// w || up
const upOrW = e => e.keyCode === 87 || e.keyCode === 38

// s || down
const downOrS = e => e.keyCode === 83 || e.keyCode === 40

// f
const justF = e => e.keyCode === 70

// Cmd + Option + i
const cmdOptionI = e => e.keyCode === 73 && e.metaKey && e.altKey

export default {
  cmdCOrReturnOrSpace,
  escOrX,
  aOrLeft,
  dOrRight,
  upOrW,
  downOrS,
  justF,
  cmdOptionI
}
