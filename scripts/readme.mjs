import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalog = JSON.parse(await fs.readFile(path.join(root, 'music/catalog.json'), 'utf8'))
const template = await fs.readFile(path.join(root, 'docs/README.template.md'), 'utf8')
const text = value => String(value || '').replace(/[\\`*_[\]<>|]/g, character => '\\' + character).replace(/[\r\n]+/g, ' ')
const duration = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
const repositoryPath = value => value.replace(/^\/+/, '')
const tracks = catalog.tracks.map(track => {
  const links = [`[网站听歌](https://qcode.im/music#${encodeURIComponent(track.id)})`, ...track.platforms.map(link => `[${text(link.name)}](${link.url})`)]
  return [
    `### ${text(track.title)}`,
    '',
    `<img src="${repositoryPath(track.cover)}" alt="歌曲封面" width="220" />`,
    '',
    `${text(track.artist)} · ${duration(track.duration)} · ${text(track.tag)}`,
    '',
    text(track.description),
    '',
    `${links.join(' · ')} · [下载 MP3](${repositoryPath(track.audio)})${track.lrc ? ` · [下载 LRC 歌词](${repositoryPath(track.lrc)})` : ''}`
  ].join('\n')
}).join('\n\n') || '新的旋律正在准备中。'
if (!template.includes('{{tracks}}')) throw Error('README 模板缺少作品列表位置')
await fs.writeFile(path.join(root, 'README.md'), template.replace('{{tracks}}', tracks))
console.log(`作品介绍已更新：${catalog.tracks.length} 首歌。`)
