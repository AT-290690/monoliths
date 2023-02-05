import { equal, deepEqual, throws } from 'assert'
import { runFromInterpreted } from '../public/chip/language/misc/utils.js'
describe('interpretation should work as expected', () => {
  it('definitions', () => {
    deepEqual(
      runFromInterpreted(
        `:= [x; 10]; := [y; 3]; := [temp; x]; = [x; y]; = [y; temp]`
      ),
      10
    )
    deepEqual(
      runFromInterpreted(`:= [x; 10; y; 23]; .: [x; y]`).items,
      [10, 23]
    )
    throws(() => runFromInterpreted(`: [29; 0]`), RangeError)
  })
  it(':: ::. ::: ::* ::? .? should work', () => {
    deepEqual(runFromInterpreted(`::: [:: ["x"; 10; "y"; 23; "z"; 4]]`).items, [
      ['x', 10],
      ['y', 23],
      ['z', 4],
    ])
    deepEqual(runFromInterpreted(`::. [:: ["x"; 10; "y"; 23; "z"; 4]]`).items, [
      'x',
      'y',
      'z',
    ])
    deepEqual(
      runFromInterpreted(`::* [:: ["x"; 10; "y"; 23; "z"; 4]]`).items,
      [10, 23, 4]
    )
    deepEqual(
      runFromInterpreted(
        `:= [obj; :: ["x"; 3; "y"; 4]]; .: [.? [obj; "z"]; .? [obj; "x"]; ::? [obj]]`
      ).items,
      [0, 1, 2]
    )
  })
  //   it('handles prototype polution', () => {
  //     throws(
  //       () =>
  //         runFromInterpreted(
  //           `. [LIBRARY; "constructor"; "constructor"]["console.log(1)"][]`
  //         ),
  //       TypeError
  //     )
  //     throws(
  //       () =>
  //         runFromInterpreted(`<- ["constructor"][. [:: ["x"; 10]; "constructor"]];
  // constructor ["console.log(2)"][];`),
  //       TypeError
  //     )
  //     throws(
  //       () =>
  //         runFromInterpreted(
  //           `. [:: ["x"; 10]; "constructor"; "constructor"]["console.log(3)"][];`
  //         ),
  //       TypeError
  //     )
  //     throws(
  //       () => runFromInterpreted(`<- ["constructor"] [. [:: []]];`),
  //       TypeError
  //     )
  //     throws(
  //       () =>
  //         runFromInterpreted(
  //           `<- ["constructor"] [. [:: []; "constructor"]]; constructor ["console.log(2)"][];`
  //         ),
  //       TypeError
  //     )
  //   })
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
   ? [>= [age; 18]; "Can work!"; "Can't work"];`
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
      `),
      28
    )
  })

  it('import should work', () => {
    deepEqual(
      runFromInterpreted(`<- ["MATH"; "ARRAY"] [LIBRARY];
      <- ["floor"] [MATH];
      >>. [.: [1.123; 3.14; 4.9]; floor];
      `).items,
      [1, 3, 4]
    )
  })

  it('nested pipes should work', () => {
    equal(
      runFromInterpreted(`
        |> [
          10;
          ^ [-> [x; * [x; 3]]];
          ^ [-> [x; * [x; 10]]]
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
    equal(runFromInterpreted(`><> [.: [1; 2; 3; 4]; -> [x;  == [x; 2]]]`), 2)
    equal(runFromInterpreted(`<>< [.: [1; 2; 3; 4]; -> [x; == [x; 2]]]`), 2)
  })
  it('>.: should work', () => {
    equal(runFromInterpreted(`>.: [.: [1; 2; 3; 4]; -> [x; == [x; 2]]]`), 1)
    equal(runFromInterpreted(`.:< [.: [1; 2; 3; 4]; -> [x; == [x; 2]]]`), 1)
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
  it('...  shoud work', () => {
    deepEqual(
      runFromInterpreted(`.: [
      ... [.: [1; 2; 3]; .: [4; 5; 6]];
      ]`).items,
      [[1, 2, 3, 4, 5, 6]]
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
      runFromInterpreted(`.:@ [.: [3; 4; 2; 1; 2; 3]; 3; 1]`).items,
      [1, 2, 3, 3, 4, 2]
    )
  })
  it('.+: should work', () => {
    equal(runFromInterpreted(`.+: [.: ["a"; "b"; "c"; "d"]; ""]`), 'abcd')
    equal(runFromInterpreted(`.+: [.: ["a"; "b"; "c"; "d"]; "-"]`), 'a-b-c-d')
  })
  it(':+ and :- should work', () => {
    deepEqual(
      runFromInterpreted(`|> [
      .: [1; 2; 3; 4; 5; 6; 7; 8];
      :+ [4; "x"; "y"; "z"];
      :- [0; 4];
      :- [3; 4]
    ]`).items,
      ['x', 'y', 'z']
    )
    deepEqual(
      runFromInterpreted(`|> [
      .: [1; 2; 3; 4; 5; 6; 7; 8];
      :+ [2; "x"; "y"; "z"];
    ]`).items,
      [1, 2, 'x', 'y', 'z', 3, 4, 5, 6, 7, 8]
    )
    deepEqual(
      runFromInterpreted(`|> [
      .: [1; 2; 3; 4; 5; 6; 7; 8];
      :- [2; 4];
    ]`).items,
      [1, 2, 7, 8]
    )
    throws(
      () => runFromInterpreted(`:- [ .: [1; 2; 3; 4; 5; 6; 7; 8]; 199; 2]`),
      RangeError
    )
    throws(
      () => runFromInterpreted(`:+ [ .: [1; 2; 3; 4; 5; 6; 7; 8]; 199; "x"]`),
      RangeError
    )
  })

  it('. .? .= .!= should work', () => {
    equal(
      runFromInterpreted(
        `:= [obj; :: ["x"; :: ["y"; 0]]]; |> [obj; . ["x"]; . ["y"]]`
      ),
      0
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]]; |> [obj; . ["x"]; . ["z"]]`
        ),
      RangeError
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]]; |> [obj; . ["z"]; . ["y"]]`
        ),
      RangeError
    )
    equal(
      runFromInterpreted(
        `:= [obj; :: ["x"; :: ["y"; 0]]]; |> [obj; . ["x"]; .= ["y"; 1]]; |> [obj; . ["x"]; . ["y"]]`
      ),
      1
    )
    equal(
      runFromInterpreted(
        `:= [obj; :: ["x"; :: ["y"; 0]]]; |> [obj; . ["x"]; .= ["z"; 1]]; |> [obj; . ["x"]; . ["z"]]`
      ),
      1
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]]; |> [obj; . ["x"]; . ["z"]; .= ["f"; 1]]`
        ),
      RangeError
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]]; |> [obj; . ["z"]; .= ["y"; 1]]`
        ),
      RangeError
    )

    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]]; .!= [obj; "x"; "z"; "f"]`
        ),
      RangeError
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]]; .!= [obj; "z"; "y"]`
        ),
      RangeError
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]];|> [obj; . ["x"]; . ["y"]; . ["m"]]`
        ),
      TypeError
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]];|> [obj; . ["x"]; . ["y"]; .? ["m"]]`
        ),
      TypeError
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]];|> [obj; . ["x"]; . ["y"]; .= ["m"; 4]]`
        ),
      TypeError
    )
    throws(
      () =>
        runFromInterpreted(
          `:= [obj; :: ["x"; :: ["y"; 0]]];|> [obj; . ["x"]; . ["y"]; .!= ["m"]]`
        ),
      TypeError
    )
  })
  it('~= should work', () => {
    deepEqual(
      runFromInterpreted(`:= [arr; .: []];
    ~= [loop1; -> [i;  .. [
      =.: [arr; .:[]];
      := [current; .> [arr]];
      ~= [loop2; -> [j;  .. [
       =.: [current; + [j; i]];
      ? [> [j; 0]; loop2 [= [j; - [j; 1]]]]]]][10];
    ? [> [i; 0]; loop1 [= [i; - [i; 1]]]]]]][10];
    arr`).items,
      [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      ]
    )
  })
  it('^ should work', () => {
    equal(
      runFromInterpreted(`:= [x; 11; y; 23];
    |> [x; 
        + [y; 23; 4];
        * [2];
        ^ [-> [x;
          * [x; x]
        ]];
       ];
    `),
      14884
    )
    equal(
      runFromInterpreted(`|> [0; 
        + [2];
        ^ [-> [x; * [x; x]]]];`),
      4
    )
  })
  it('<> </> .:. >< should work', () => {
    equal(
      runFromInterpreted(
        `|> [
      .: [1; 2; 3; 4];
      <> [.: [1; 2; 4]];
      .< []
    ];
    `
      ),
      3
    )
    deepEqual(
      runFromInterpreted(`|> [
      .: [1; 2; 3; 4; 5; 6; 7];
      </> [.: [1; 2; 4; 6]];
    ];
    `).items,
      [3, 5, 7]
    )

    deepEqual(
      runFromInterpreted(`|> [
      .: [1; 2; 3; 4; 5; 6; 7];
      .:. [.: [1; 2; 4; 6]];
    ];
    `).items,
      [1, 2, 3, 4, 5, 6, 7, 1, 2, 4, 6]
    )

    deepEqual(
      runFromInterpreted(`
    |> [
      .: [1; 2; 3; 4; 5; 6; 7];
      >< [.: [1; 2; 4; 6]];
    ];
    `).items,
      [1, 2, 4, 6]
    )
  })
  it('<-:: and <-.: should work', () => {
    deepEqual(
      runFromInterpreted(`:= [obj; :: ["x"; 10; "y"; 12; "z"; 10]];
  <-:: [x; y; z; obj]; .:[x; y; z]`).items,
      [10, 12, 10]
    )
    deepEqual(
      runFromInterpreted(`:= [arr; .: [1; 2; 3; 4; 5; 6; 7; 8]];
       <-.: [a; b; c; rest; arr]; .: [a; b; c; rest]`).items,
      [1, 2, 3, [4, 5, 6, 7, 8]]
    )
  })
})
