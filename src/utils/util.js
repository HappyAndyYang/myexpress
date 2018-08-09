import moment from 'moment';

export const errObj = (errCode, err) => ({
  errCode,
  errStr: typeof err === 'string' ? err : err.message,
});

export const rightObj = body => ({
  errCode: '0',
  rtnObj: body,
});

export const getRemoteIp = req => req.headers['x-forwarded-for'] || req.ip;

export const checkErr = e => (e.name === 'OperationError' ? e.message : '');

export const getLogArgs = log => (name, args) => {
  let message = `[${name} args] - `;
  Object.entries(args).forEach((item) => { message += `${item[0]}: ${item[1]} `; });
  log.debug(message);
};

export const psCodeBuilder = (id, generateTime) => {
  if (id < 0) { // 省自有策略
    return 'provincial';
  } if (id === 0) { // 平日策略
    return `PN${moment(generateTime).format('YYYYMMDD')}00`;
  }
  const idPad = String(id).padStart(2, 0);
  return `PS${moment(generateTime).format('YYYYMMDD')}${idPad}`;
};

/**
 * 生成策略 ID
 * @param {*} ruleId 策略 ID (短)
 * @param {*} psId 策略集 ID (短)
 * @param {*} psCodeStr 记录集团下发的策略集 ID (长)
 * @param {*} pnCodeStr 平日策略集 ID (长)
 * @param {*} regionId 省 ID
 * @param {*} strategyType 策略类型
 */
export const ruleIdBuilder = (ruleId, psId, psCodeStr, pnCodeStr, regionId, strategyType) => {
  const ruleIdPad = String(ruleId).padStart(6, 0);
  if (psId < 0) { // 省自有策略
    // const psCode = `PN${moment(generateTime).format('YYYYMMDD')}00`;
    return `${pnCodeStr}${regionId}00${strategyType}${ruleIdPad}`;
  }
  // 统一策略
  // const psCode = psCodeBuilder(psId, generateTime);
  return `${psCodeStr}0000${strategyType}${ruleIdPad}`;
};

export function Id2Name(aObj, id) {
  const obj = aObj.find(item => item.id === id);
  if (obj && obj.name) {
    return obj.name;
  }
  return id;
}
