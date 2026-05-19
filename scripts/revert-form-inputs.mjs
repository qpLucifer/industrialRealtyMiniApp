import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'src', 'pages')

const files = [
  'property/publish.vue',
  'customer/new.vue',
  'customer/edit.vue',
  'customer/follow.vue',
]

const mpAttrs = ' :adjust-position="false" :cursor-spacing="80"'

for (const rel of files) {
  const file = path.join(root, rel)
  let s = fs.readFileSync(file, 'utf8')
  s = s.replace(/<PfInput\b/g, '<input')
  s = s.replace(/<PfTextarea\b/g, '<textarea')
  s = s.replace(/<FormInput\b/g, '<input')
  s = s.replace(/<FormTextarea\b/g, '<textarea')
  // Add keyboard attrs once per opening tag (avoid duplicate on re-run)
  s = s.replace(/<input(?![^>]*adjust-position)/g, `<input${mpAttrs}`)
  s = s.replace(/<textarea(?![^>]*adjust-position)/g, `<textarea${mpAttrs} :auto-height="false"`)
  fs.writeFileSync(file, s)
  console.log('reverted', rel)
}
