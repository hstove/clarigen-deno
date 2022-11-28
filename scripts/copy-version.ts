import { resolve } from '../src/deps.ts';

const packageJsonPath = resolve(Deno.cwd(), 'package.json');
const packageContents = await Deno.readTextFile(packageJsonPath);
const { version }: { version: string } = JSON.parse(packageContents);

const versionPath = resolve(Deno.cwd(), './src/cli/version.ts');

const versionFile = `export const VERSION = 'v${version}';`;

await Deno.writeTextFile(versionPath, versionFile);
