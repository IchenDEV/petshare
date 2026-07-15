import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const codexHome = process.env.CODEX_HOME || path.join(process.env.HOME || '', '.codex');
const sourceRoot = path.join(codexHome, 'pets');
const publicRoot = path.join(repoRoot, 'public');
const publicPetsRoot = path.join(publicRoot, 'pets');
const downloadsRoot = path.join(publicRoot, 'downloads');
const requiredFiles = ['pet.json', 'spritesheet.webp'];

function assertZipAvailable() {
  const result = spawnSync('zip', ['-v'], { stdio: 'ignore' });
  if (result.error) {
    throw new Error('The zip command is required to package downloadable pets.');
  }
}

async function readPetManifest(petDir, id) {
  const manifestPath = path.join(petDir, 'pet.json');
  const raw = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  return {
    id: manifest.id || id,
    displayName: manifest.displayName || id,
    description: manifest.description || '',
    spriteVersionNumber: manifest.spriteVersionNumber,
    spritesheetPath: `/pets/${id}/spritesheet.webp`,
    manifestPath: `/pets/${id}/pet.json`,
    downloadPath: `/downloads/${id}.zip`,
  };
}

async function syncPet(id) {
  const sourceDir = path.join(sourceRoot, id);
  const targetDir = path.join(publicPetsRoot, id);

  for (const fileName of requiredFiles) {
    const sourceFile = path.join(sourceDir, fileName);
    if (!existsSync(sourceFile)) {
      throw new Error(`Missing ${fileName} for pet ${id}`);
    }
  }

  await mkdir(targetDir, { recursive: true });
  await copyFile(path.join(sourceDir, 'pet.json'), path.join(targetDir, 'pet.json'));
  await copyFile(path.join(sourceDir, 'spritesheet.webp'), path.join(targetDir, 'spritesheet.webp'));

  const zipPath = path.join(downloadsRoot, `${id}.zip`);
  const zipResult = spawnSync('zip', ['-qr', zipPath, id], {
    cwd: sourceRoot,
    stdio: 'inherit',
  });

  if (zipResult.status !== 0) {
    throw new Error(`Failed to create ${zipPath}`);
  }

  return readPetManifest(sourceDir, id);
}

async function main() {
  if (!existsSync(sourceRoot)) {
    throw new Error(`Pet source directory not found: ${sourceRoot}`);
  }

  assertZipAvailable();
  await rm(publicPetsRoot, { recursive: true, force: true });
  await rm(downloadsRoot, { recursive: true, force: true });
  await mkdir(publicPetsRoot, { recursive: true });
  await mkdir(downloadsRoot, { recursive: true });

  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const petIds = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const pets = [];
  for (const id of petIds) {
    pets.push(await syncPet(id));
  }

  await writeFile(path.join(publicRoot, 'pets.json'), `${JSON.stringify(pets, null, 2)}\n`);
  console.log(`Synced ${pets.length} pets from ${sourceRoot}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
