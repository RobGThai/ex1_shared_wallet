import test from 'ava';

import { accounts, contract } from '@openzeppelin/test-environment';
const [ owner ] = accounts;

const Allowance = contract.fromArtifact('Allowance');

test.before(async t => {
  t.context.allowance = await Allowance.new({ from: owner });
});

test('the deployer is the owner', async t => {
  t.is(await t.context.allowance.owner(), owner);
});
