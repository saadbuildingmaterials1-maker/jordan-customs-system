; NSIS Installer Script
; نظام إدارة تكاليف الشحن والجمارك الأردنية

!include "MUI2.nsh"
!include "x64.nsh"

; إعدادات المتغيرات
!define PRODUCT_NAME "نظام إدارة تكاليف الشحن والجمارك الأردنية"
!define PRODUCT_VERSION "1.0.1"
!define PRODUCT_PUBLISHER "Jordan Customs"
!define PRODUCT_WEB_SITE "https://jordancustoms.com"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\JordanCustoms.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

; إعدادات الواجهة
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "Arabic"

; اسم الملف والمجلد
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "releases\${PRODUCT_NAME}-${PRODUCT_VERSION}-installer.exe"
InstallDir "$PROGRAMFILES\JordanCustoms"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

; فحص الأذونات
Function .onInit
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}
FunctionEnd

; قسم التثبيت
Section "Install"
  SetOutPath "$INSTDIR"
  
  ; نسخ الملفات
  File /r "dist\*.*"
  File /r "node_modules\*.*"
  File "electron-main.js"
  File "preload.js"
  File "package.json"
  
  ; إنشاء اختصارات
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\JordanCustoms.exe"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\JordanCustoms.exe"
  
  ; تسجيل في السجل
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\JordanCustoms.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  
  ; إنشاء برنامج الإزالة
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

; قسم الإزالة
Section "Uninstall"
  ; حذف الملفات والمجلدات
  RMDir /r "$INSTDIR"
  
  ; حذف الاختصارات
  RMDir /r "$SMPROGRAMS\${PRODUCT_NAME}"
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  
  ; حذف من السجل
  DeleteRegKey HKLM "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
SectionEnd
