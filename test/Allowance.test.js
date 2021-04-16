import test from 'ava';

// BN.js usage standardized by Ethereum to handlee BigNumber.
// https://github.com/ethjs/ethjs-unit/blob/master/docs/user-guide.md
import BN from 'bn.js';

import { accounts, contract } from '@openzeppelin/test-environment';
const [owner, user1] = accounts;

const Allowance = contract.fromArtifact('Allowance');

function debugError(e) {
    console.log('>>>>>>>>>>>>>>>>>>>>');
    console.log(e.instanceOf);
    console.log('----');
    console.log(e.is);
    console.log('----');
    console.log(e.code);
    console.log('----');
    console.log(e.name);
    console.log('----');
}

test.before(async t => {
    t.context.allowance = await Allowance.new({ from: owner });
});

test('the deployer is the owner', async t => {
    t.is(await t.context.allowance.owner(), owner);
});

test('Others cannot SetAllowance', async t => {
    const e = await t.throwsAsync(async () => {
        await t.context.allowance.setAllowance(user1, 2, { from: user1 });
    });

    t.true(e.message.includes('Ownable: caller is not the owner.'));
});

test('SetAllowance should store given value', async t => {
    const value2 = new BN('2', 10);
    await t.context.allowance.setAllowance(user1, value2, { from: owner });
    const stored = await t.context.allowance.allowance(user1);

    // Use is if you concern about type, otherwise true.
    t.is(stored.toNumber(), value2.toNumber());
    t.true(stored.toNumber() == value2);
});

test('SetAllowance should emit AllowanceChanged', async t => {
    const value2 = new BN('2', 10);
    const tx = await t.context.allowance.setAllowance(user1, value2, { from: owner });
    const { logs } = tx;

    const event = logs[0];
    // There must be a betteer way surely?
    t.is(event.event, 'AllowanceChanged');
    t.is(event.args._forWho, user1);
    t.is(event.args._byWhom, owner);
    t.is(event.args._oldAmount.toNumber(), 0);
    t.is(event.args._newAmount.toNumber(), value2.toNumber());
});
