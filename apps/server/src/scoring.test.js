import test from 'node:test';import assert from 'node:assert/strict';import {calculateDailyScore,checklistPoints} from './scoring.js';
test('completion scales to ten points',()=>{assert.equal(checklistPoints(100),10);assert.equal(checklistPoints(83),8.3)});
test('penalties apply and score never drops below zero',()=>{assert.deepEqual(calculateDailyScore({completionPercent:100,unaccounted:1,uniformViolations:[2],inspectionPassed:true,bonus:5}),{base:10,penalties:7,bonus:5,total:8});assert.equal(calculateDailyScore({completionPercent:100,inspectionPassed:false}).total,0)});
test('missing submission scores zero',()=>assert.equal(calculateDailyScore({completionPercent:100,submitted:false,bonus:5}).total,0));
