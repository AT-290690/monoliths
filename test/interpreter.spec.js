import { equal, deepEqual, throws } from 'assert'
import { runFromInterpreted } from '../public/chip/language/misc/utils.js'
describe('interpretation should work as expected', () => {
  it('definitions', () => {
    deepEqual(
      runFromInterpreted(
        `:= [x; 10]; := [y; 3]; := [temp; x]; = [x; y]; = [y; temp]; :: ["x"; x; "y"; y]`
      ),
      { x: 3, y: 10 }
    )
    throws(() => runFromInterpreted(`: [29; 0]`), RangeError)
  })
  it('types', () => {
    deepEqual(
      runFromInterpreted(`
      <- ["CONVERT"] [LIBRARY];
  <- ["boolean"] [CONVERT];

  := [type of; -> [entity; ? [== [entity; void]; void; . [entity; "constructor"; "name"]]]];

  >> [.: [0; "0"; boolean [0]; :: ["0"; 0]; .: [0]; -> [0]; void]; -> [x; i; a; ^= [a; i; type of [x]]]];
      `).items,
      ['Number', 'String', 'Boolean', 'Object', 'Brrr', 'Function', void 0]
    )
  })
  it('simple math', () => {
    equal(
      runFromInterpreted(
        `:= [x; 30]; := [result; + [: [* [+ [1; 2; 3]; 2]; % [4; 3]]; x]];`
      ),
      42
    )
    throws(() => runFromInterpreted(`: [29; 0]`), RangeError)
  })

  it('if', () => {
    equal(
      runFromInterpreted(
        `:= [age; 18];
   ? [>= [age; 18]; "Can work!"; "Can't work"];
      `
      ),
      'Can work!'
    )
    deepEqual(
      runFromInterpreted(`
          := [validate age; -> [age; ? [>= [age; 18]; ~ ["Can work"; ? [>=[age; 21]; " and can drink"; ""]]; "Can't work and can't drink"]]];
          .: [validate age [18]; validate age [21]; validate age [12]];
      `).items,
      ['Can work', 'Can work and can drink', "Can't work and can't drink"]
    )
  })

  it('switch case', () => {
    deepEqual(
      runFromInterpreted(`
       := [switch case; -> [matcher;
            ?? [
            . [:: [
              "knock knock"; -> [..["who's there"]];
              "meaning of life"; -> [..[42]];
              ;; add more cases here
              ;; ...
            ]; matcher];
              ;; default case
            -> ["nothing matched"]
          ][]]];
          .: [switch case ["meaning of life"]; switch case [0]; switch case  ["knock knock"]];
      `).items,
      [42, 'nothing matched', "who's there"]
    )
  })

  it('fib sum', () => {
    equal(
      runFromInterpreted(`;; calculating fib sequance
          := [fib; -> [n; ? [
            > [n; 0];
               ? [== [n; 1]; 1;
                ? [== [n; 2]; 1;
                  + [fib [- [n; 1]]; fib [- [n; 2]]]]]; n]]];
                fib[10]
                  `),
      55
    )
  })

  it('max sub array sum rec', () => {
    equal(
      runFromInterpreted(`;; max_sub_array_recursive
      <- ["MATH"] [LIBRARY];
      <- ["max"; "infinity"] [MATH];
      ~= [loop; -> [i; nums; maxGlobal; maxSoFar;
          ? [< [i; .:? [nums]]; .. [
          = [maxGlobal; max [maxGlobal; = [maxSoFar; max [0; + [maxSoFar; :. [nums; i]]]]]];
          loop [= [i; + [i; 1]]; nums; maxGlobal; maxSoFar]];
          maxGlobal]]]
      [0; .: [1; -2; 10; -5; 12; 3; -2; 3; -199; 10]; * [infinity; -1]; * [infinity; -1]]`),
      21
    )
  })
  it('sum median', () => {
    equal(
      runFromInterpreted(`
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
      `),
      1
    )
  })

  it('sum tree nodes', () => {
    equal(
      runFromInterpreted(`;; sum_tree_nodes
      := [node; -> [value; left; right;
        :: ["value"; value;
            "left"; left;
            "right"; right]]];

      := [sum; -> [item;
        ? [== [item; void];
          0;
          + [. [item; "value"];
             sum [. [item; "left"]];
             sum [. [item; "right"]]]]]];

      := [myTree;
        node [1;
          node [2;
            node [4; void; void];
            node [6; void; void]];
        node [3;
          node [5; void; void];
          node [7; void; void]]]];
          sum [myTree]
      `),
      28
    )
  })

  it('length of string', () => {
    equal(runFromInterpreted(`. ["01010"; "length"];`), 5)
  })

  it('import should work', () => {
    deepEqual(
      runFromInterpreted(`<- ["MATH"; "ARRAY"] [LIBRARY];
      <- ["map"] [ARRAY];
      <- ["floor"] [MATH];
      map [.: [1.123; 3.14; 4.9]; floor];
      `).items,
      [1, 3, 4]
    )
  })

  it('nested pipes should work', () => {
    equal(
      runFromInterpreted(`
        |> [
          10;
          call [-> [x; * [x; 3]]];
          call [-> [x; * [x; 10]]]
        ]`),
      300
    )
  })
  it(':+: should work', () => {
    deepEqual(runFromInterpreted('|> [.: [1; 2; 3; 4; 5; 6]; :+: [3]]').items, [
      [1, 2, 3],
      [4, 5, 6],
    ])
  })
  it('>> and << should work', () => {
    deepEqual(
      runFromInterpreted(`
    := [out; .: []];
    >> [.: [1; 2; 3; 4]; -> [x; i; a; .:= [out; * [x; 10]]]];
    << [.: [10; 20; 30]; -> [x; i; a; .:= [out; - [:. [out; i]; * [x; 0.1]]]]];
    >> [out; -> [x; i; a; ^= [out; i; + [x; i]]]];
    out;
      `).items,
      [10, 21, 32, 43, 31, 23, 15]
    )

    deepEqual(
      runFromInterpreted(`
      |> [
        .: [1; 2; 3; 4];
        >> [-> [x; i; a; ^= [a; i; * [x; 10]]]];
        << [-> [x; i; a; ^= [a; i; - [:. [a; i]; * [x; 0.1]]]]];
        >> [-> [x; i; a; ^= [a; i; + [x; i]]]];
        << [-> [x; i; a; ^= [a; i; + [:. [a; i]; i; 1]]]];
      ]
      `).items,
      [10, 21, 32, 43]
    )
  })

  it('><> should work', () => {
    equal(
      runFromInterpreted(`><> [.: [1; 2; 3; 4]; -> [x; i; a; == [x; 2]]]`),
      2
    )
  })
  it('>>. and .<< should work', () => {
    deepEqual(
      runFromInterpreted(`>>. [.: [1; 2; 3; 4]; -> [x; i; a; + [i; * [x; 2]]]]`)
        .items,
      [2, 5, 8, 11]
    )
    deepEqual(
      runFromInterpreted(`.<< [.: [1; 2; 3; 4]; -> [x; i; a; + [i; * [x; 2]]]]`)
        .items,
      [2, 5, 8, 11].reverse()
    )
  })

  it('@ should work', () => {
    deepEqual(
      runFromInterpreted(`:= [arr; .:[]]; @ [3; -> [.:=[arr; 1]]]`).items,
      [1, 1, 1]
    )
  })
  it('|. should work', () => {
    equal(
      runFromInterpreted(`|> [
      .: [1; 2; 3];
     |. [];
     + [100]]`),
      103
    )
  })
  it('.| should work', () => {
    equal(
      runFromInterpreted(`|> [
      .: [1; 2; 3];
      .| [];
     + [100]]`),
      101
    )
  })
  it('... and ::: shoud work', () => {
    deepEqual(
      runFromInterpreted(`.: [
      ... [.: [1; 2; 3]; .: [4; 5; 6]];
      ::: [:: ["x"; 10]; :: ["y"; 23]]
      ]`).items,
      [[1, 2, 3, 4, 5, 6], { x: 10, y: 23 }]
    )
  })
  it('*:: and ~:: should work', () => {
    deepEqual(
      runFromInterpreted(` |> [
      .: [3; 4; 2; 1; 2; 3];
      *:: [-> [a; b; ? [> [a; b]; -1; 1]]]
    ];
    `).items,
      [4, 3, 3, 2, 2, 1]
    )
    deepEqual(
      runFromInterpreted(` |> [
      .: [3; 4; 2; 1; 2; 3];
      ~:: [-1]
    ];
    `).items,
      [4, 3, 3, 2, 2, 1]
    )
  })
  it('.:@ should work', () => {
    deepEqual(
      runFromInterpreted(`
      .:@ [.: [3; 4; 2; 1; 2; 3]; 2; -1]
    `).items,
      [2, 1, 2, 3, 3, 4]
    )
    deepEqual(
      runFromInterpreted(`
      .:@ [.: [3; 4; 2; 1; 2; 3]; 3; 1]
    `).items,
      [1, 2, 3, 3, 4, 2]
    )
  })
  it('.+: should work', () => {
    equal(
      runFromInterpreted(`
      .+: [.: ["a"; "b"; "c"; "d"]; ""]
    `),
      'abcd'
    )
    equal(
      runFromInterpreted(`
      .+: [.: ["a"; "b"; "c"; "d"]; "-"]
    `),
      'a-b-c-d'
    )
  })
})
