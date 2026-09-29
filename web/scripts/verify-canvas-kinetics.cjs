// web/scripts/verify-canvas-kinetics.cjs
const assert = require('assert');

class Spring1D {
  constructor(initial, k, damping) {
    this.current = initial;
    this.target = initial;
    this.velocity = 0;
    this.k = k;
    this.c = damping || 2 * Math.sqrt(k);
    this.eps = 0.001;
  }

  step(dt) {
    // Clamp dt to 0.033s to prevent tab-backgrounding explosion
    const clampedDt = Math.min(dt, 0.033);
    const force = -this.k * (this.current - this.target) - this.c * this.velocity;
    this.velocity += force * clampedDt;
    this.current += this.velocity * clampedDt;

    if (Math.abs(this.target - this.current) < this.eps && Math.abs(this.velocity) < this.eps) {
      this.current = this.target;
      this.velocity = 0;
      return false;
    }
    return true;
  }
}

class SpringVector2D {
  constructor(initialX, initialY, k, damping) {
    this.currentX = initialX;
    this.currentY = initialY;
    this.targetX = initialX;
    this.targetY = initialY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.k = k;
    this.c = damping || 2 * Math.sqrt(k);
    this.eps = 0.001;
  }

  step(dt) {
    const clampedDt = Math.min(dt, 0.033);
    const forceX = -this.k * (this.currentX - this.targetX) - this.c * this.velocityX;
    const forceY = -this.k * (this.currentY - this.targetY) - this.c * this.velocityY;

    this.velocityX += forceX * clampedDt;
    this.velocityY += forceY * clampedDt;

    this.currentX += this.velocityX * clampedDt;
    this.currentY += this.velocityY * clampedDt;

    const isResting =
      Math.abs(this.targetX - this.currentX) < this.eps &&
      Math.abs(this.targetY - this.currentY) < this.eps &&
      Math.abs(this.velocityX) < this.eps &&
      Math.abs(this.velocityY) < this.eps;

    if (isResting) {
      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.velocityX = 0;
      this.velocityY = 0;
      return false;
    }
    return true;
  }
}

console.log('[KINETICS TEST] Initializing spring oscillator verification...');

// Test 1: Critical Damping Convergence
const spring = new Spring1D(0, 250);
spring.target = 100;
let steps = 0;
const dt = 0.016; // 60fps frame delta

while (steps < 200) {
  const active = spring.step(dt);
  steps++;
  if (!active || (Math.abs(spring.current - 100) < 0.05 && Math.abs(spring.velocity) < 0.05)) {
    break;
  }
}

console.log(`- Convergence to target achieved in ${steps} steps (${(steps * dt).toFixed(3)}s)`);
assert(steps < 120, `Spring took too long to converge (${steps} steps > 120)`);
assert(Math.abs(spring.current - 100) < 0.1, 'Spring did not converge to target');

// Test 2: Zero Overshoot on Critical Damping
let maxVal = 0;
const springOvershoot = new Spring1D(0, 200);
springOvershoot.target = 50;
for (let i = 0; i < 150; i++) {
  springOvershoot.step(0.016);
  if (springOvershoot.current > maxVal) maxVal = springOvershoot.current;
}
console.log(`- Peak value recorded: ${maxVal.toFixed(3)} (target: 50.0)`);
assert(maxVal <= 50.05, `Overshoot detected in critically damped spring: peak=${maxVal}`);

// Test 3: Numerical Stability under Variable Delta Times (Drop frames simulation)
const jitterSpring = new Spring1D(0, 300);
jitterSpring.target = 1000;
const erraticDts = [0.016, 0.008, 0.033, 0.060, 0.001, 0.016];
for (let i = 0; i < 300; i++) {
  const variableDt = erraticDts[i % erraticDts.length];
  jitterSpring.step(variableDt);
  assert(!isNaN(jitterSpring.current), 'Spring produced NaN under erratic frame rates');
  assert(isFinite(jitterSpring.current), 'Spring exploded to Infinity');
}
console.log(`- Erratic frame rate stability verified: final value = ${jitterSpring.current.toFixed(1)}`);
assert(Math.abs(jitterSpring.current - 1000) < 0.1, 'Jitter spring did not reach target');

// Test 4: Multi-dimensional SpringVector2D
const spring2D = new SpringVector2D(0, 0, 220);
spring2D.targetX = 150;
spring2D.targetY = -200;
let steps2D = 0;
while (steps2D < 200) {
  const active = spring2D.step(0.016);
  steps2D++;
  if (!active) break;
}
console.log(`- SpringVector2D convergence achieved in ${steps2D} steps: (${spring2D.currentX.toFixed(1)}, ${spring2D.currentY.toFixed(1)})`);
assert(steps2D < 120, 'SpringVector2D took too long to converge');
assert(Math.abs(spring2D.currentX - 150) < 0.05, 'SpringVector2D X failed');
assert(Math.abs(spring2D.currentY - (-200)) < 0.05, 'SpringVector2D Y failed');

console.log('✓ All Kinetic Physics mathematical assertions passed cleanly.');
