import { getDevice, getWxEnv, ieIE, isMobile } from './env';
import {
  compressImage,
  convertBase64ToFile,
  downloadFile,
  fileToBase64,
  getAudioDuration
} from './file';
import { debounce, getAccessType, sleep, throttle } from './function';
import { convertCurrency, numberToChinese, randomNumber } from './number';
import { filterObjectEmpty } from './object';
import {
  RegExp1IdNumber,
  RegExp2IdNumber,
  RegExp12Time,
  RegExp24Time,
  RegExpAccount,
  RegExpAllNumberPlate,
  RegExpAlphanumeric,
  RegExpAMIDCard,
  RegExpAmount,
  RegExpBase64,
  RegExpCapital,
  RegExpCardNumber,
  RegExpCharacter,
  RegExpChineseAndNumbers,
  RegExpCN,
  RegExpCNName,
  RegExpColor16,
  RegExpContinuousCharacters,
  RegExpDate,
  RegExpDecimals,
  RegExpEd2k,
  RegExpEmail,
  RegExpEmailLoose,
  RegExpEnglishAlphabet,
  RegExpENName,
  RegExpFloatingNumber,
  RegExpGrade,
  RegExpHKIDCard,
  RegExpHTMLAnnotation,
  RegExpHTMLDOM,
  RegExpIdNumber,
  RegExpImageUrlPath,
  RegExpIMEI,
  RegExpInteger,
  RegExpIP,
  RegExpIPV4,
  RegExpIPV6,
  RegExpJavaPackageName,
  RegExpLinuxDirPath,
  RegExpLinuxFilePath,
  RegExpLinuxHiddenDirPath,
  RegExpLowercase,
  RegExpMac,
  RegExpMagnet,
  RegExpMD5,
  RegExpMobilePhoneLoose,
  RegExpMobilePhoneNumberStrict,
  RegExpMobilePhoneNunber,
  RegExpNegativeInteger,
  RegExpNewEnergyNumberPlate,
  RegExpNotLetter,
  RegExpNumber,
  RegExpNumberAmount,
  RegExpNumberPlate,
  RegExpPassport,
  RegExpPasswordStrength,
  RegExpPositiveInteger,
  RegExpPostalCode,
  RegExpQQNumber,
  RegExpRungDate,
  RegExpSocialCreditCode,
  RegExpSocialCreditCodeStrict,
  RegExpStockA,
  RegExpStrongPassword,
  RegExpSubNet,
  RegExpTelPhone,
  RegExpThunder,
  RegExpTrain,
  RegExpTWIDCard,
  RegExpURL,
  RegExpUserName,
  RegExpUuid,
  RegExpVersion,
  RegExpVideoUrlPath,
  RegExpWindowsDirPath,
  RegExpWindowsFilePath,
  RegExpWXNumber
} from './regexp';
import { random4Code, randomChar, toHump, toLine, uuid } from './string';

export {
  getDevice,
  ieIE,
  isMobile,
  getWxEnv,
  compressImage,
  convertBase64ToFile,
  downloadFile,
  fileToBase64,
  getAudioDuration,
  debounce,
  getAccessType,
  sleep,
  throttle,
  convertCurrency,
  numberToChinese,
  filterObjectEmpty,
  random4Code,
  randomChar,
  randomNumber,
  toHump,
  toLine,
  uuid,
  RegExp12Time,
  RegExp1IdNumber,
  RegExp24Time,
  RegExp2IdNumber,
  RegExpAMIDCard,
  RegExpAccount,
  RegExpAllNumberPlate,
  RegExpAlphanumeric,
  RegExpAmount,
  RegExpBase64,
  RegExpCN,
  RegExpCNName,
  RegExpCapital,
  RegExpCardNumber,
  RegExpCharacter,
  RegExpChineseAndNumbers,
  RegExpColor16,
  RegExpContinuousCharacters,
  RegExpDate,
  RegExpDecimals,
  RegExpENName,
  RegExpEd2k,
  RegExpEmail,
  RegExpEmailLoose,
  RegExpEnglishAlphabet,
  RegExpFloatingNumber,
  RegExpGrade,
  RegExpHKIDCard,
  RegExpHTMLAnnotation,
  RegExpHTMLDOM,
  RegExpIMEI,
  RegExpIP,
  RegExpIPV4,
  RegExpIPV6,
  RegExpIdNumber,
  RegExpImageUrlPath,
  RegExpInteger,
  RegExpJavaPackageName,
  RegExpLinuxDirPath,
  RegExpLinuxFilePath,
  RegExpLinuxHiddenDirPath,
  RegExpLowercase,
  RegExpMD5,
  RegExpMac,
  RegExpMagnet,
  RegExpMobilePhoneLoose,
  RegExpMobilePhoneNumberStrict,
  RegExpMobilePhoneNunber,
  RegExpNegativeInteger,
  RegExpNewEnergyNumberPlate,
  RegExpNotLetter,
  RegExpNumber,
  RegExpNumberAmount,
  RegExpNumberPlate,
  RegExpPassport,
  RegExpPasswordStrength,
  RegExpPositiveInteger,
  RegExpPostalCode,
  RegExpQQNumber,
  RegExpRungDate,
  RegExpSocialCreditCode,
  RegExpSocialCreditCodeStrict,
  RegExpStockA,
  RegExpStrongPassword,
  RegExpSubNet,
  RegExpTWIDCard,
  RegExpTelPhone,
  RegExpThunder,
  RegExpTrain,
  RegExpURL,
  RegExpUserName,
  RegExpUuid,
  RegExpVersion,
  RegExpVideoUrlPath,
  RegExpWXNumber,
  RegExpWindowsDirPath,
  RegExpWindowsFilePath
};
