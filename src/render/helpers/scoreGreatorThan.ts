import {
  Score,
  TestType,
} from '../../constants';


export default (type: TestType, a: Score, b: Score): number => {
  const av = a.data.split(',').map(Number) as number[];
  const bv = b.data.split(',').map(Number) as number[];
  switch (type) {
  case TestType.Running800:
  case TestType.Running1000:
    return bv[1] - av[1];
  case TestType.Running50:
    return bv[0] - av[0];
  case TestType.RopeSkipping:
  case TestType.Situps:
  case TestType.StandingLongJump:
  case TestType.VitalCapacity:
  case TestType.SitAndReach:
  case TestType.PullUp:
  case TestType.MedicineBall:
    return av[0] - bv[0];
  case TestType.RunningBackAndForth:
    return av[1] - bv[1] || bv[2] - av[2];
  case TestType.HeightAndWeight:
    return av[0] - bv[0] || bv[1] - av[1];
  }
  return 0;
}
