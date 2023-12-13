// simple script for testing variable eval
import { getSession } from '../src/session.ts';
// import { convertVariables, getVariables } from '../src/cli/files/variables.ts';
import { serialize } from '../src/cli/files/base.ts';

const session = getSession();

const contract = session.contracts.find((c) =>
  c.contract_id.includes('counter')
)!;

const { ast } = contract as any;

// console.log(ast);

const { expr, ...exp } = ast.expressions[5];

console.log(exp);

console.log(serialize(expr.List));

// session.contracts.forEach((c) => {
//   const vars = getVariables(c, session.session_id);
//   console.log(c.contract_id, '\n', vars);
//   const converted = convertVariables(c, vars);
//   console.log(converted);
// });
