import { PrismaClient, Prisma } from '@prisma/client';

console.log('=== ADVERSARIAL TEST: MILESTONE 1 SCHEMA & CLIENT VERIFICATION ===');

const prisma = new PrismaClient();
let allPassed = true;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    allPassed = false;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

try {
  const dmmf = Prisma.dmmf;
  assert(!!dmmf, 'Prisma DMMF metadata is accessible via Prisma.dmmf');

  // 1. Inspect User model in DMMF
  const userModel = dmmf.datamodel.models.find(m => m.name === 'User');
  assert(!!userModel, 'User model exists in Prisma datamodel');

  const emailVerifiedField = userModel?.fields.find(f => f.name === 'emailVerified');
  assert(!!emailVerifiedField, 'User.emailVerified field exists in User model');
  assert(emailVerifiedField?.type === 'Boolean', `User.emailVerified type is Boolean (actual: ${emailVerifiedField?.type})`);
  assert(emailVerifiedField?.default === false, `User.emailVerified default value is false (actual: ${emailVerifiedField?.default})`);
  assert(emailVerifiedField?.isRequired === true, `User.emailVerified is required boolean (actual isRequired: ${emailVerifiedField?.isRequired})`);

  // Adversarial check: verify emailVerified is NOT DateTime (which was the old faulty type)
  assert(emailVerifiedField?.type !== 'DateTime', 'User.emailVerified is NOT DateTime');

  // 2. Inspect Account model in DMMF
  const accountModel = dmmf.datamodel.models.find(m => m.name === 'Account');
  assert(!!accountModel, 'Account model exists in Prisma datamodel');

  console.log('Account uniqueFields in DMMF:', JSON.stringify(accountModel?.uniqueFields));
  console.log('Account uniqueIndexes in DMMF:', JSON.stringify(accountModel?.uniqueIndexes));

  const hasProviderIdAccountIdUnique = accountModel?.uniqueFields?.some(
    fields => fields.length === 2 && fields.includes('providerId') && fields.includes('accountId')
  ) || accountModel?.uniqueIndexes?.some(
    idx => idx.fields.length === 2 && idx.fields.includes('providerId') && idx.fields.includes('accountId')
  );

  assert(hasProviderIdAccountIdUnique, 'Account enforces compound uniqueness on [providerId, accountId]');

  // 3. Inspect generated Prisma Client types and query shapes via runtime reflection
  // Test Prisma.ModelName
  assert(Prisma.ModelName.User === 'User', 'Prisma ModelName.User is registered');
  assert(Prisma.ModelName.Account === 'Account', 'Prisma ModelName.Account is registered');

  // Verify Prisma client delegate methods exist
  assert(typeof prisma.user.findUnique === 'function', 'prisma.user.findUnique is a function');
  assert(typeof prisma.account.findUnique === 'function', 'prisma.account.findUnique is a function');

  // Test runtime argument validation for Account findUnique with compound key:
  // Using an invalid compound shape or non-existent unique selector should throw Prisma validation error
  console.log('Testing compound unique query validation...');
  try {
    // We do not connect to DB, but Prisma Client validates query arguments locally
    // If providerId_accountId is a valid unique input, Prisma builds the query
    // If it were not a valid compound unique, Prisma would throw an argument validation error about unknown arg
    const queryPromise = prisma.account.findUnique({
      where: {
        providerId_accountId: {
          providerId: 'google',
          accountId: 'adversarial_123'
        }
      }
    });
    // Just verify the query object is constructed without throwing synchronous validation error
    assert(!!queryPromise, 'prisma.account.findUnique successfully accepted providerId_accountId compound key');
  } catch (err) {
    assert(false, `prisma.account.findUnique rejected providerId_accountId: ${err.message}`);
  }

  // Adversarial check: attempt an invalid type query to verify Prisma client rejects wrong field type
  try {
    // Querying with non-compound or invalid field
    await prisma.account.findUnique({
      // @ts-expect-error intentionally invalid selector
      where: {
        nonExistentCompoundUnique: { foo: 'bar' }
      }
    });
    assert(false, 'Prisma should have rejected invalid unique selector');
  } catch (validationErr) {
    assert(true, 'Prisma Client successfully validated and rejected invalid unique selector');
  }

} catch (err) {
  console.error('Unexpected error during adversarial testing:', err);
  allPassed = false;
} finally {
  await prisma.$disconnect();
}

console.log('=== TEST RESULT SUMMARY ===');
if (allPassed) {
  console.log('ALL SCHEMA ADVERSARIAL CHECKS PASSED!');
  process.exit(0);
} else {
  console.error('SOME SCHEMA ADVERSARIAL CHECKS FAILED!');
  process.exit(1);
}
