import { rmSync } from 'node:fs'

for (const dir of ['out', '.next']) {
  rmSync(dir, { recursive: true, force: true })
}
