import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

class _RwMaterialLocalizationsDelegate extends LocalizationsDelegate<MaterialLocalizations> {
  const _RwMaterialLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == 'rw';

  @override
  Future<MaterialLocalizations> load(Locale locale) async {
    return SynchronousFuture<MaterialLocalizations>(RwMaterialLocalizations());
  }

  @override
  bool shouldReload(_RwMaterialLocalizationsDelegate old) => false;
}

class RwMaterialLocalizations extends GlobalMaterialLocalizations {
  RwMaterialLocalizations()
      : super(
          localeName: 'rw',
          fullYearFormat: intl.DateFormat.y(),
          compactDateFormat: intl.DateFormat.yMd(),
          shortDateFormat: intl.DateFormat.yMMMd(),
          mediumDateFormat: intl.DateFormat.yMMMEd(),
          longDateFormat: intl.DateFormat.yMMMMd(),
          yearMonthFormat: intl.DateFormat.yMMM(),
          shortMonthDayFormat: intl.DateFormat.MMMd(),
          decimalFormat: intl.NumberFormat.decimalPattern(),
          twoDigitZeroPaddedFormat: intl.NumberFormat('00'),
        );

  static const LocalizationsDelegate<MaterialLocalizations> delegate = _RwMaterialLocalizationsDelegate();

  String get aboutListTileTitleRaw => 'Ibyerekeye \$applicationName';

  @override
  String get alertDialogLabel => 'Ikitonderwa';

  @override
  String get anteMeridiemAbbreviation => 'AM';

  @override
  String get backButtonTooltip => 'Gusubira inyuma';

  @override
  String get cancelButtonLabel => 'Guhagarika';

  @override
  String get closeButtonLabel => 'Gufunga';

  @override
  String get closeButtonTooltip => 'Funga';

  @override
  String get collapsedIconTapHint => 'Kwagura';

  @override
  String get continueButtonLabel => 'Gukomeza';

  @override
  String get copyButtonLabel => 'Gukoporora';

  @override
  String get cutButtonLabel => 'Gukata';

  String get deleteButtonLabel => 'Gusiba';

  @override
  String get dialogLabel => 'Idirishya';

  @override
  String get drawerLabel => 'Ibikubiyemo';

  @override
  String get expandedIconTapHint => 'Guhinanya';

  @override
  String get hideAccountsLabel => 'Hisha konti';

  @override
  String get licensesPageTitle => 'Impushya';

  @override
  String get modalBarrierDismissLabel => 'Kuvamo';

  @override
  String get nextMonthTooltip => 'Ukwezi gutaha';

  @override
  String get nextPageTooltip => 'Ipaji itaha';

  @override
  String get okButtonLabel => 'Yego';

  @override
  String get openAppDrawerTooltip => 'Fungura ibikubiyemo';

  String get pageRowsInfoTitleRaw => '\$firstRow–\$lastRow kuri \$rowCount';

  String get pageRowsInfoTitleApproximateRaw => '\$firstRow–\$lastRow kuri hafi \$rowCount';

  @override
  String get pasteButtonLabel => 'Komeka';

  @override
  String get popupMenuLabel => 'Ibikubiyemo bihinduka';

  @override
  String get postMeridiemAbbreviation => 'PM';

  @override
  String get previousMonthTooltip => 'Ukwezi gushize';

  @override
  String get previousPageTooltip => 'Ipaji ibanza';

  @override
  String get refreshIndicatorSemanticLabel => 'Kuvugurura';

  @override
  String get remainingTextFieldCharacterCountZero => 'Nta nyuguti zisigaye';

  @override
  String get remainingTextFieldCharacterCountOne => 'Inyuguti 1 isigaye';

  @override
  String get remainingTextFieldCharacterCountOther => 'Inyuguti \$remainingCount zisigaye';

  @override
  String get rowsPerPageTitle => 'Imirongo kuri paji:';

  @override
  String get saveButtonLabel => 'Kubika';

  String get scrollUnderlineMessage => 'Kurura ujye hejuru';

  @override
  String get selectAllButtonLabel => 'Hitamo byose';

  @override
  String get showAccountsLabel => 'Yerekana konti';

  @override
  String get showMenuTooltip => 'Yerekana ibikubiyemo';

  @override
  String get signedInLabel => 'Yinjiye';

  String get tabLabelRaw => 'Tab \$tabIndex kuri \$tabCount';

  @override
  String get timePickerHourModeAnnouncement => 'Hitamo amasaha';

  @override
  String get timePickerMinuteModeAnnouncement => 'Hitamo iminota';

  @override
  String get viewLicensesButtonLabel => 'Reba impushya';

  @override
  ScriptCategory get scriptCategory => ScriptCategory.englishLike;

  @override
  String get searchFieldLabel => 'Shaka';

  @override
  String get selectedRowCountTitleOne => 'Ikintu 1 gihiswemo';

  @override
  String get selectedRowCountTitleOther => 'Ibintu \$selectedRowCount bihiswemo';

  @override
  String get firstPageTooltip => 'Ipaji ya mbere';

  @override
  String get lastPageTooltip => 'Ipaji ya nyuma';

  @override
  String get dateSeparator => '/';

  @override
  String get dateHelpText => 'mm/dd/yyyy';

  @override
  String get selectYearSemanticsLabel => 'Hitamo umwaka';

  @override
  String get unspecifiedDate => 'Itariki';

  @override
  String get unspecifiedDateRange => 'Igihe kirekire';

  @override
  String get dateInputLabel => 'Injiza itariki';

  @override
  String get dateRangeStartLabel => 'Itariki itangira';

  @override
  String get dateRangeEndLabel => 'Itariki isoza';

  String get dateRangeDatePickerLabel => 'Hitamo igihe';

  @override
  String get invalidDateFormatLabel => 'Imiterere y\'itariki itariyo.';

  @override
  String get invalidDateRangeLabel => 'Igihe kidakwiye.';

  String get invalidDateEmptyLabel => 'Injiza itariki.';

  String get dateRangeScrollInstructions => 'Kurura kugira ngo urebe izindi matariki.';

  @override
  String get calendarModeButtonLabel => 'Guhindura kuri kalendari';

  String get inputModeButtonLabel => 'Guhindura ku nyandiko';

  @override
  String get datePickerHelpText => 'HITAMO ITARIKI';

  @override
  String get dateRangePickerHelpText => 'HITAMO IGIHE';

  String get datePickerTitle => 'Hitamo itariki';

  String get dateRangePickerTitle => 'Hitamo igihe';

  String get timePickerDialHelpText => 'HITAMO IGIHE';

  @override
  String get timePickerInputHelpText => 'INJIZA IGIHE';

  @override
  String get timePickerHourLabel => 'Isaha';

  @override
  String get timePickerMinuteLabel => 'Umunota';

  @override
  String get invalidTimeLabel => 'Igihe kidakwiye';

  @override
  String get dialModeButtonLabel => 'Guhindura ku isaha';

  @override
  String get inputTimeModeButtonLabel => 'Guhindura ku nyandiko';

  @override
  String get licensesPackageDetailTextZero => 'Nta mpushya zihari';

  @override
  String get licensesPackageDetailTextOne => 'Impushya 1';

  @override
  String get licensesPackageDetailTextOther => 'Impushya \$licenseCount';

  String get keyboardKeyAlt => 'Alt';

  String get keyboardKeyAltGraph => 'AltGr';

  String get keyboardKeyBackspace => 'Backspace';

  String get keyboardKeyCapsLock => 'Caps Lock';

  String get keyboardKeyControl => 'Control';

  String get keyboardKeyDelete => 'Delete';

  String get keyboardKeyEject => 'Eject';

  String get keyboardKeyEnd => 'End';

  String get keyboardKeyEnter => 'Enter';

  String get keyboardKeyEscape => 'Esc';

  String get keyboardKeyFn => 'Fn';

  String get keyboardKeyHome => 'Home';

  String get keyboardKeyInsert => 'Insert';

  String get keyboardKeyMeta => 'Meta';

  String get keyboardKeyMetaMac => 'Command';

  String get keyboardKeyMetaWindows => 'Win';

  String get keyboardKeyNumLock => 'Num Lock';

  String get keyboardKeyNumpad0 => 'Num 0';

  String get keyboardKeyNumpad1 => 'Num 1';

  String get keyboardKeyNumpad2 => 'Num 2';

  String get keyboardKeyNumpad3 => 'Num 3';

  String get keyboardKeyNumpad4 => 'Num 4';

  String get keyboardKeyNumpad5 => 'Num 5';

  String get keyboardKeyNumpad6 => 'Num 6';

  String get keyboardKeyNumpad7 => 'Num 7';

  String get keyboardKeyNumpad8 => 'Num 8';

  String get keyboardKeyNumpad9 => 'Num 9';

  String get keyboardKeyNumpadAdd => 'Num +';

  String get keyboardKeyNumpadComma => 'Num ,';

  String get keyboardKeyNumpadDecimal => 'Num .';

  String get keyboardKeyNumpadDivide => 'Num /';

  String get keyboardKeyNumpadEnter => 'Num Enter';

  String get keyboardKeyNumpadEqual => 'Num =';

  String get keyboardKeyNumpadMultiply => 'Num *';

  String get keyboardKeyNumpadParenLeft => 'Num (';

  String get keyboardKeyNumpadParenRight => 'Num )';

  String get keyboardKeyNumpadSubtract => 'Num -';

  String get keyboardKeyPageDown => 'PgDown';

  String get keyboardKeyPageUp => 'PgUp';

  String get keyboardKeyPower => 'Power';

  String get keyboardKeyPrintScreen => 'Print Screen';

  String get keyboardKeyScrollLock => 'Scroll Lock';

  String get keyboardKeySelect => 'Select';

  String get keyboardKeySpace => 'Space';

  String get keyboardKeyTab => 'Tab';

  String get keyboardKeyShift => 'Shift';

  String get dateRangeEndDateSemanticLabelRaw => 'Itariki isoza \$fullDate';

  String get dateRangeStartDateSemanticLabelRaw => 'Itariki itangira \$fullDate';

  String get scrimOnTapHintRaw => 'Funga \$modalBarrierDismissLabel';

   TimeOfDayFormat get timeOfDayFormatRaw => TimeOfDayFormat.H_colon_mm;

  String get bottomSheetLabel => 'Idirishya ryo hepfo';

  String get clearButtonTooltip => 'Siba';

  String get currentDateLabel => 'Uyu munsi';

  String get dateOutOfRangeLabel => 'Itariki iri hanze y\'igihe kiremewe.';

  String get deleteButtonTooltip => 'Siba';

  String get keyboardKeyChannelDown => 'Channel Down';

  String get keyboardKeyChannelUp => 'Channel Up';

  String get keyboardKeyMetaMacOs => 'Command';

  String get keyboardKeyPowerOff => 'Power Off';

  String get moreButtonTooltip => 'Ibindi';

  String get scanTextButtonLabel => 'Sikana inyandiko';

  String get scrimLabel => 'Scrim';

  String get selectedDateLabel => 'Itariki ihiswemo';

  // These are implemented without @override to satisfy MaterialLocalizations interface 
  // without causing conflicts with GlobalMaterialLocalizations in older SDKs.
  String get menuDismissLabel => 'Kuraho ibikubiyemo';
  String get collapsedHint => 'Kwagura';
  String get expandedHint => 'Guhinanya';
  String get expansionTileCollapsedTapHint => 'Kwagura kugira ngo urebe ibindi';
  String get expansionTileExpandedTapHint => 'Guhinanya';
  String get expansionTileCollapsedHint => 'Kanda kabiri kugira ngo wagure';
  String get expansionTileExpandedHint => 'Kanda kabiri kugira ngo uhine';
  String get scanCodeTooltip => 'Sikana kode';
  String get inputDateModeButtonLabel => 'Guhindura ku nyandiko y\'itariki';
  String get lookUpButtonLabel => 'Shaka';
  String get menuBarMenuLabel => 'Ibikubiyemo';
  String get reorderItemDown => 'Imura hepfo';
  String get reorderItemLeft => 'Imura iburyo';
  String get reorderItemRight => 'Imura ibumoso';
  String get reorderItemToEnd => 'Imura uheruke';
  String get reorderItemToStart => 'Imura ubanze';
  String get reorderItemUp => 'Imura hejuru';
  String get searchWebButtonLabel => 'Shaka kuri interineti';
  String get shareButtonLabel => 'Sangira';
}

class _RwCupertinoLocalizationsDelegate extends LocalizationsDelegate<CupertinoLocalizations> {
  const _RwCupertinoLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == 'rw';

  @override
  Future<CupertinoLocalizations> load(Locale locale) async {
    return SynchronousFuture<CupertinoLocalizations>(RwCupertinoLocalizations());
  }

  @override
  bool shouldReload(_RwCupertinoLocalizationsDelegate old) => false;
}

class RwCupertinoLocalizations extends GlobalCupertinoLocalizations {
  RwCupertinoLocalizations()
      : super(
          localeName: 'rw',
          fullYearFormat: intl.DateFormat.y(),
          dayFormat: intl.DateFormat.d(),
          mediumDateFormat: intl.DateFormat.MMMEd(),
          weekdayFormat: intl.DateFormat.E(),
          doubleDigitMinuteFormat: intl.DateFormat('mm'),
          singleDigitHourFormat: intl.DateFormat.H(),
          singleDigitMinuteFormat: intl.DateFormat.m(),
          singleDigitSecondFormat: intl.DateFormat.s(),
          decimalFormat: intl.NumberFormat.decimalPattern(),
        );

  static const LocalizationsDelegate<CupertinoLocalizations> delegate = _RwCupertinoLocalizationsDelegate();

  @override
  String get alertDialogLabel => 'Ikitonderwa';

  @override
  String get anteMeridiemAbbreviation => 'AM';

  @override
  String get postMeridiemAbbreviation => 'PM';

  @override
  String get copyButtonLabel => 'Gukoporora';

  @override
  String get cutButtonLabel => 'Gukata';

  @override
  String get pasteButtonLabel => 'Komeka';

  @override
  String get selectAllButtonLabel => 'Hitamo byose';

  @override
  String get todayLabel => 'Uyu munsi';

  @override
  String get searchTextFieldPlaceholderLabel => 'Shaka';

  String get noSpellCheckReplacementsLabel => 'Nta byasimbuzwa byabonetse';

  @override
  String get backButtonLabel => 'Inyuma';

  @override
  String get cancelButtonLabel => 'Reka';

  String get timerPickerHourLabelOne => 'isaha';

  String get timerPickerHourLabelOther => 'amasaha';

  String get timerPickerMinuteLabelOne => 'umunota';

  String get timerPickerMinuteLabelOther => 'iminota';

  String get timerPickerSecondLabelOne => 'isegonda';

  String get timerPickerSecondLabelOther => 'amasegonda';

  String get datePickerHourSemanticsLabelOne => 'isaha \$hour';

  String get datePickerHourSemanticsLabelOther => 'amasaha \$hour';

  String get datePickerMinuteSemanticsLabelOne => 'umunota \$minute';

  String get datePickerMinuteSemanticsLabelOther => 'iminota \$minute';

  @override
  String get datePickerDateOrderString => 'mdy';

  @override
  String get datePickerDateTimeOrderString => 'date_time_dayPeriod';

  @override
  String get modalBarrierDismissLabel => 'Kuvamo';

  String get tabSemanticsLabelRaw => 'Tab \$tabIndex kuri \$tabCount';

  // These satisfy the CupertinoLocalizations interface without causing superclass mismatch.
  String get menuDismissLabel => 'Kuvamo';
  String get lookUpButtonLabel => 'Shaka';
  String get searchWebButtonLabel => 'Shaka kuri interineti';
  String get shareButtonLabel => 'Sangira';
  String get clearButtonLabel => 'Siba byose';
  String get collapsedHint => 'Kwagura';
  String get expandedHint => 'Guhinanya';
  String get expansionTileCollapsedHint => 'Kanda kabiri kugira ngo wagure';
  String get expansionTileCollapsedTapHint => 'Kwagura kugira ngo urebe ibindi';
  String get expansionTileExpandedHint => 'Kanda kabiri kugira ngo uhine';
  String get expansionTileExpandedTapHint => 'Guhinanya';
}
