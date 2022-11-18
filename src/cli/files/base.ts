import { abiFunctionType, jsTypeFromAbiType } from '../declaration.ts';
import type { Session, SessionContract } from '../../session.ts';
import {
  encodeVariableName,
  sortContracts,
  toCamelCase,
} from '../cli-utils.ts';
import { types } from '../type-stub.ts';
import { ClarityAbiVariable } from '../../types.ts';

export function generateContractMeta(
  contract: SessionContract,
) {
  const abi = contract.contract_interface;
  const functionLines: string[] = [];
  const { functions, maps, variables, non_fungible_tokens, ...rest } = abi;

  functions.forEach((func) => {
    let functionLine = `${toCamelCase(func.name)}: `;
    const funcDef = JSON.stringify(func);
    functionLine += funcDef;
    const functionType = abiFunctionType(func);
    functionLine += ` as ${functionType}`;
    functionLines.push(functionLine);
  });

  const mapLines = maps.map((map) => {
    let mapLine = `${toCamelCase(map.name)}: `;
    const keyType = jsTypeFromAbiType(map.key, true);
    const valType = jsTypeFromAbiType(map.value);
    mapLine += JSON.stringify(map);
    mapLine += ` as TypedAbiMap<${keyType}, ${valType}>`;
    return mapLine;
  });

  const otherAbi = JSON.stringify(rest);
  const contractName = contract.contract_id.split('.')[1];

  const variableLines = encodeVariables(variables);

  const nftLines = non_fungible_tokens.map((nft) => {
    return `${JSON.stringify(nft)} as ClarityAbiTypeNonFungibleToken`;
  });

  return `{
  ${serializeLines('functions', functionLines)}
  ${serializeLines('maps', mapLines)}
  ${serializeLines('variables', variableLines)}
  constants: {},
  ${serializeArray('non_fungible_tokens', nftLines)}
  ${otherAbi.slice(1, -1)},
  contractName: '${contractName}',
  }`;
}

export function generateBaseFile(
  session: Session,
) {
  const contractDefs = sortContracts(session.contracts).map((contract) => {
    const meta = generateContractMeta(contract);
    const id = contract.contract_id.split('.')[1];
    const keyName = toCamelCase(id);
    return `${keyName}: ${meta}`;
  });

  const file = `
${types}

export const contracts = {
  ${contractDefs.join(',\n')}
} as const;

`;
  return file;
}

export function encodeVariables(variables: ClarityAbiVariable[]) {
  return variables.map((v) => {
    let varLine = `${encodeVariableName(v.name)}: `;
    const type = jsTypeFromAbiType(v.type);
    const varJSON = serialize(v);
    varLine += `${varJSON} as TypedAbiVariable<${type}>`;
    return varLine;
  });
}

// deno-lint-ignore no-explicit-any
export function serialize(obj: any) {
  return Deno.inspect(obj, {
    showHidden: false,
    iterableLimit: 100000,
    compact: false,
    trailingComma: true,
    depth: 100,
    colors: false,
    // strAbbreviateSize: 100000,
  });
}

function serializeLines(key: string, lines: string[]) {
  return `"${key}": {
    ${lines.join(',\n    ')}
  },`;
}

function serializeArray(key: string, lines: string[]) {
  return `"${key}": [
    ${lines.join(',\n    ')}
  ],`;
}
