import { fixture } from './auth-fixture.js';

// O guard da fixture exige um banco descartável exclusivo antes de qualquer limpeza.
const test = await fixture();
try {
  await test.reset();
} finally {
  await test.close();
}
