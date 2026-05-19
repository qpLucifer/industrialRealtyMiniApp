import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'src', 'pages')

const files = [
  'property/publish.vue',
  'customer/new.vue',
  'customer/edit.vue',
  'customer/follow.vue',
]

for (const rel of files) {
  const file = path.join(root, rel)
  let s = fs.readFileSync(file, 'utf8')
  s = s.replace(/<input\b/g, '<PfInput')
  s = s.replace(/<textarea\b/g, '<PfTextarea')
  if (rel === 'customer/new.vue' || rel === 'customer/edit.vue') {
    s = s.replace(/<PfInput/g, '<FormInput')
    s = s.replace(/<PfTextarea/g, '<FormTextarea')
  }
  fs.writeFileSync(file, s)
  console.log('patched', rel)
}
