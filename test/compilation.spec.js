import { equal, deepEqual } from 'assert'
import {
  runFromInterpreted,
  runFromCompiled,
} from '../public/chip/language/misc/utils.js'
describe('compilation should work as expected', () => {
  it('definitions', () => {
    const source1 = `:= [x; 10]; := [y; 3]; := [temp; x]; = [x; y]; = [y; temp]; :: ["x"; x; "y"; y]`
    deepEqual(runFromInterpreted(source1), runFromCompiled(source1))
    const source2 = `:= [x; 10; y; 23]; .: [x; y]`
    deepEqual(runFromInterpreted(source2), runFromCompiled(source2))
  })
  it('simple math', () => {
    const source = `:= [x; 30]; := [result; + [: [* [+ [1; 2; 3]; 2]; % [4; 3]]; x]];`
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('if', () => {
    const source1 = `:= [age; 18];
      ? [>= [age; 18]; "Can work!"; "Can't work"];
         `
    equal(runFromInterpreted(source1), runFromCompiled(source1))
    const source2 = `
      := [validate age; -> [age; ? [>= [age; 18]; ~ ["Can work"; ? [>=[age; 21]; " and can drink"; ""]]; "Can't work and can't drink"]]];
      .: [validate age [18]; validate age [21]; validate age [12]];
  `
    deepEqual(runFromInterpreted(source2), runFromCompiled(source2))
  })

  it('fib sum', () => {
    const source = `;; calculating fib sequance
      := [fib; -> [n; ? [
        > [n; 0];
           ? [== [n; 1]; 1;
            ? [== [n; 2]; 1;
              + [fib [- [n; 1]]; fib [- [n; 2]]]]]; n]]];
            fib[10]
              `
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('max sub array sum rec', () => {
    const source = `;; max_sub_array_recursive
      <- ["MATH"] [LIBRARY];
      <- ["max"; "infinity"] [MATH];
      ~= [loop; -> [i; nums; maxGlobal; maxSoFar;
          ? [< [i; .:? [nums]]; .. [
          = [maxGlobal; max [maxGlobal; = [maxSoFar; max [0; + [maxSoFar; :. [nums; i]]]]]];
          loop [= [i; + [i; 1]]; nums; maxGlobal; maxSoFar]];
          maxGlobal]]]
        [0; .: [1; -2; 10; -5; 12; 3; -2; 3; -199; 10]; * [infinity; -1]; * [infinity; -1]]`
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('sum median', () => {
    const source = `
      <- ["MATH"; "ARRAY"] [LIBRARY];
      <- ["sum"] [MATH];
      <- ["range"] [ARRAY];
      := [NUMBERS; range [1; 100]];
      := [first; :. [NUMBERS; 0]];
      := [last; :. [NUMBERS; - [.:? [NUMBERS]; 1]]];
      := [median; + [first;
      - [* [last; * [+ [1; last]; 0.5]];
          * [first; * [+ [1; first]; 0.5]]]]];
      == [sum [NUMBERS]; median]
          `
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('sum tree nodes', () => {
    const source = `;; sum_tree_nodes
      := [node; -> [value; left; right;
        :: ["value"; value;
            "left"; left;
            "right"; right]]];
      := [sum; -> [item;
        ? [== [item; 0];
          0;
          + [. [item; "value"];
             sum [. [item; "left"]];
             sum [. [item; "right"]]]]]];
      := [myTree;
        node [1;
          node [2;
            node [4; 0; 0];
            node [6; 0; 0]];
        node [3;
          node [5; 0; 0];
          node [7; 0; 0]]]];
          sum [myTree]
      `
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('length of string', () => {
    const source = `.:? [.-: ["01010"; ""]];`
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('split and join', () => {
    const source = `.+:[.-: ["01010"; ""]; "-"];`
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('import should work', () => {
    const source = `<- ["MATH"; "ARRAY"] [LIBRARY];
      <- ["floor"] [MATH];
      >>. [.: [1.123; 3.14; 4.9]; floor];
      `
    deepEqual(runFromInterpreted(source), runFromCompiled(source))
  })
  it('nested pipes should work', () => {
    const source = `|> [
        10;
        ^ [-> [x; * [x; 3]]];
        ^ [-> [x; * [x; 10]]]
      ]`
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('>> and << should work', () => {
    const source1 = `
    := [out; .: []];
    >> [.: [1; 2; 3; 4]; -> [x; i; a; .:= [out; * [x; 10]]]];
    << [.: [10; 20; 30]; -> [x; i; a; .:= [out; - [:. [out; i]; * [x; 0.1]]]]];
    >> [out; -> [x; i; a; ^= [out; i; + [x; i]]]];
    out;
    `
    deepEqual(runFromInterpreted(source1), runFromCompiled(source1))
    const source2 = `
      |> [
        .: [1; 2; 3; 4];
        >> [-> [x; i; a; ^= [a; i; * [x; 10]]]];
        << [-> [x; i; a; ^= [a; i; - [:. [a; i]; * [x; 0.1]]]]];
        >> [-> [x; i; a; ^= [a; i; + [x; i]]]];
        << [-> [x; i; a; ^= [a; i; + [:. [a; i]; i; 1]]]];
      ]
      `
    deepEqual(runFromInterpreted(source2), runFromCompiled(source2))

    const source3 = `
      |> [
        .: [1; 2; 3; 4];
        >>. [-> [x; i; a; * [x; 10]]];
        >- [-> [x; i; a; % [x; 2]]]
      ]
      `
    deepEqual(runFromInterpreted(source3), runFromCompiled(source3))
  })

  it('><> should work', () => {
    const source = `><> [.: [1; 2; 3; 4]; -> [x; i; a; == [x; 2]]]`
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('>>. and .<< should work', () => {
    const source1 = `>>. [.: [1; 2; 3; 4]; -> [x; i; a; + [i; * [x; 2]]]]`
    deepEqual(runFromInterpreted(source1), runFromCompiled(source1))
    // findLast doesn't exist in node still
    // const source2 = `.<< [.: [1; 2; 3; 4]; -> [x; i; a; + [i; * [x; 2]]]]`
    // deepEqual(runFromInterpreted(source2), runFromCompiled(source2))
  })

  it('@ should work', () => {
    const source = `:= [arr; .:[]]; @ [3; -> [.:=[arr; 1]]]`
    deepEqual(runFromInterpreted(source), runFromCompiled(source))
  })
  it('|. should work', () => {
    const source = `|> [
      .: [1; 2; 3];
     |. [];
     + [100]]`
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('.| should work', () => {
    const source = `|> [
      .: [1; 2; 3];
     |. [];
     + [100]]`
    equal(runFromInterpreted(source), runFromCompiled(source))
  })
  it('... shoud work', () => {
    const source = `.: [
      ... [.: [1; 2; 3]; .: [4; 5; 6]];
      ]`
    deepEqual(runFromInterpreted(source), runFromCompiled(source))
  })
  it('*:: and ~:: should work', () => {
    const source1 = ` |> [
      .: [3; 4; 2; 1; 2; 3];
      *:: [-> [a; b; ? [> [a; b]; -1; 1]]]
    ];
    `
    const source2 = ` |> [
      .: [3; 4; 2; 1; 2; 3];
      ~:: [-1]
    ];
    `
    deepEqual(runFromInterpreted(source1), runFromCompiled(source2))
    deepEqual(runFromInterpreted(source2), runFromCompiled(source2))
  })
  it(':: ::. ::: ::* .? ::? should work', () => {
    const source1 = `::: [:: ["x"; 10; "y"; 23; "z"; 4]]`
    const source2 = `::. [:: ["x"; 10; "y"; 23; "z"; 4]]`
    const source3 = `::* [:: ["x"; 10; "y"; 23; "z"; 4]]`
    deepEqual(runFromInterpreted(source1), runFromCompiled(source1))
    deepEqual(runFromInterpreted(source2), runFromCompiled(source2))
    deepEqual(runFromInterpreted(source3), runFromCompiled(source3))
  })
  it(':+: should work', () => {
    const source1 = `|> [
      .: [3; 4; 2; 1; 2; 3];
      :+: [3]
    ];`
    deepEqual(runFromInterpreted(source1), runFromCompiled(source1))
    const source2 = `:+: [.: [3; 4; 2; 1; 2; 3]; 2];`
    deepEqual(runFromInterpreted(source2), runFromCompiled(source2))
  })
  it(':+ and :- should work', () => {
    const source1 = `|> [
      .: [1; 2; 3; 4; 5; 6; 7; 8];
      :+ [4; "x"; "y"; "z"];
      :- [0; 4];
      :- [3; 4]
    ]`
    const source2 = `|> [
      .: [1; 2; 3; 4; 5; 6; 7; 8];
      :+ [2; "x"; "y"; "z"];
    ]`
    const source3 = `|> [
      .: [1; 2; 3; 4; 5; 6; 7; 8];
      :- [2; 4];
    ]`
    const source4 = `:= [obj; :: ["x"; 3; "y"; 4]]; .: [.? [obj; "z"]; .? [obj; "x"]; ::? [obj]]`
    deepEqual(runFromInterpreted(source1), runFromCompiled(source1))
    deepEqual(runFromInterpreted(source2), runFromCompiled(source2))
    deepEqual(runFromInterpreted(source3), runFromCompiled(source3))
    deepEqual(runFromInterpreted(source4), runFromCompiled(source4))
  })
  it('~= should work', () => {
    const source = `:= [arr; .: []];
    ~= [loop1; -> [i;  .. [
      =.: [arr; .:[]];
      := [current; .> [arr]];
      ~= [loop2; -> [j;  .. [
       =.: [current; + [j; i]];
      ? [> [j; 0]; loop2 [= [j; - [j; 1]]]]]]][10];
    ? [> [i; 0]; loop1 [= [i; - [i; 1]]]]]]][10];
    arr`
    deepEqual(runFromInterpreted(source), runFromCompiled(source))
  })
  it(':: should work', () => {
    const source = `:= [d; :: ["x"; 10; "y"; 23]];
    :: ["y"; 5; "m"; :: ["x"; :: ["x"; 10; "y"; d]; "y"; 23];]`
    deepEqual(runFromInterpreted(source), runFromCompiled(source))
  })
  it('^ should work', () => {
    const source1 = `:= [x; 11; y; 23];
    |> [x; 
        + [y; 23; 4];
        * [2];
        ^ [-> [x;
          * [x; x]
        ]];
       ];
    `
    const source2 = `|> [0; 
      + [2];
      ^ [-> [x; * [x; x]]]];`
    equal(runFromInterpreted(source1), runFromCompiled(source1))
    equal(runFromInterpreted(source2), runFromCompiled(source2))
  })
})
