import { readFileSync } from 'node:fs'

const guide = readFileSync(new URL('../content/guide.md', import.meta.url), 'utf8')
const expected = [
  '«ИННОВАЦИОННЫЙ ДВИГАТЕЛЬ»',
  'Практическая система развития креативного мышления',
  'Введение',
  'ЧАСТЬ 1\\. ВООБРАЖЕНИЕ',
  'ЧАСТЬ 2\\. ВНИМАНИЕ',
  'ЧАСТЬ 3\\. МЫШЛЕНИЕ РЕСУРСАМИ',
  'ЧАСТЬ 4\\. СРЕДА',
  'ЧАСТЬ 5\\. КУЛЬТУРА ЭКСПЕРИМЕНТА',
  '10 УПРАЖНЕНИЙ ДЛЯ РАЗВИТИЯ КРЕАТИВНОСТИ',
  'ФИНАЛЬНЫЙ ЧЕЛЛЕНДЖ',
  'День 7:',
  'Это способность генерировать достаточно идей, чтобы среди них появилась гениальная.',
]
const missing = expected.filter((value) => !guide.includes(value))
if (missing.length) throw new Error(`Missing guide content: ${missing.join(', ')}`)
const exerciseCount = (guide.match(/^## \*\*\d+\\?\./gm) || []).length
const dayCount = (guide.match(/\*\*День [1-7]:\*\*/g) || []).length
if (exerciseCount !== 10 || dayCount !== 7) throw new Error(`Expected 10 exercises and 7 days, found ${exerciseCount} and ${dayCount}`)
console.log(`Content integrity passed: ${exerciseCount} exercises, ${dayCount} challenge days.`)
