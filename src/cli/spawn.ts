interface Result {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}

export async function spawn(
  cmd: string[] | string,
  cwd?: string,
): Promise<Result> {
  const _cmd = typeof cmd === 'string' ? cmd.split(' ') : cmd;
  // deno-lint-ignore no-deprecated-deno-api
  const process = Deno.run({
    cmd: _cmd,
    cwd,
    stderr: 'piped',
    stdout: 'piped',
  });

  const [status, stdoutBytes, stderrBytes] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput(),
    process.close(),
  ]);

  const decoder = new TextDecoder();
  const stdout = decoder.decode(stdoutBytes);
  const stderr = decoder.decode(stderrBytes);

  return {
    status,
    stdout,
    stderr,
  };
}
