# دليل تطوير تطبيق الهاتف المحمول
# Mobile App Development Guide

## نظرة عامة | Overview

تطبيق الهاتف المحمول لنظام إدارة تكاليف الشحن والجمارك الأردنية يوفر واجهة سهلة الاستخدام للوصول إلى جميع الميزات الرئيسية من الهاتف الذكي.

The mobile app for Jordan Customs System provides an easy-to-use interface to access all main features from your smartphone.

## المتطلبات التقنية | Technical Requirements

### iOS
- **الحد الأدنى:** iOS 13.0
- **الإصدار المستهدف:** iOS 17.0
- **اللغات المدعومة:** Swift, Objective-C
- **المكتبات الموصى بها:**
  - Alamofire (للشبكة)
  - Realm (لقاعدة البيانات)
  - KeychainAccess (للأمان)

### Android
- **الحد الأدنى:** SDK 24 (Android 7.0)
- **الإصدار المستهدف:** SDK 34 (Android 14)
- **اللغات المدعومة:** Kotlin, Java
- **المكتبات الموصى بها:**
  - Retrofit (للشبكة)
  - Room (لقاعدة البيانات)
  - Jetpack Security (للأمان)

## الميزات الرئيسية | Key Features

### 1. المصادقة والأمان | Authentication & Security
```
- تسجيل الدخول عبر OAuth
- المصادقة البيومترية (بصمة الإصبع / التعرف على الوجه)
- تشفير البيانات المحلية
- انتهاء الجلسة التلقائي
```

### 2. لوحة التحكم | Dashboard
```
- ملخص الإحصائيات الرئيسية
- الشحنات الأخيرة
- الدفعات المعلقة
- الإشعارات الفورية
```

### 3. إدارة الدفع | Payment Management
```
- إنشاء فواتير جديدة
- تتبع الدفعات
- سجل المعاملات
- الإيصالات الرقمية
```

### 4. إدارة الشحن | Shipping Management
```
- إنشاء شحنات جديدة
- تتبع الشحنات
- طباعة التسميات
- تحديثات الحالة الفورية
```

### 5. التقارير والتحليلات | Reports & Analytics
```
- تقارير مخصصة
- رسوم بيانية تفاعلية
- تصدير البيانات
- التحليلات التنبؤية
```

## خطوات التطوير | Development Steps

### المرحلة 1: الإعداد الأولي | Phase 1: Initial Setup

```bash
# iOS
pod install
xcodebuild -scheme JordanCustomsApp -configuration Release

# Android
./gradlew clean build
./gradlew assembleRelease
```

### المرحلة 2: تطوير الواجهات | Phase 2: UI Development

1. **الشاشة الرئيسية | Home Screen**
   - شعار التطبيق
   - أزرار التنقل الرئيسية
   - الإشعارات

2. **شاشة تسجيل الدخول | Login Screen**
   - حقول الإدخال
   - خيارات المصادقة البيومترية
   - استرجاع كلمة المرور

3. **لوحة التحكم | Dashboard Screen**
   - الإحصائيات الرئيسية
   - الرسوم البيانية
   - قائمة الإجراءات السريعة

### المرحلة 3: التكامل مع الخادم | Phase 3: Server Integration

```swift
// iOS Example
let apiClient = APIClient(baseURL: "https://jordan-customs-system.manus.space")
apiClient.request(.dashboard) { result in
    switch result {
    case .success(let data):
        // Handle success
    case .failure(let error):
        // Handle error
    }
}
```

```kotlin
// Android Example
val apiService = ApiService.create()
apiService.getDashboard().enqueue(object : Callback<Dashboard> {
    override fun onResponse(call: Call<Dashboard>, response: Response<Dashboard>) {
        // Handle success
    }
    override fun onFailure(call: Call<Dashboard>, t: Throwable) {
        // Handle error
    }
})
```

### المرحلة 4: الاختبار | Phase 4: Testing

```bash
# iOS Unit Tests
xcodebuild test -scheme JordanCustomsApp -configuration Debug

# Android Unit Tests
./gradlew test

# Integration Tests
./gradlew connectedAndroidTest
```

### المرحلة 5: النشر | Phase 5: Deployment

#### iOS - App Store
```bash
# Build Archive
xcodebuild -scheme JordanCustomsApp -archivePath build/JordanCustomsApp.xcarchive archive

# Export for App Store
xcodebuild -exportArchive -archivePath build/JordanCustomsApp.xcarchive \
  -exportPath build/ipa -exportOptionsPlist ExportOptions.plist
```

#### Android - Google Play
```bash
# Build Signed APK
./gradlew assembleRelease -Pandroid.injected.signing.store.file=keystore.jks \
  -Pandroid.injected.signing.store.password=password \
  -Pandroid.injected.signing.key.alias=alias \
  -Pandroid.injected.signing.key.password=password

# Build Bundle
./gradlew bundleRelease
```

## معايير الجودة | Quality Standards

### الأداء | Performance
- **وقت التحميل:** < 3 ثواني
- **استهلاك الذاكرة:** < 150 MB
- **استهلاك البطارية:** < 5% في الساعة
- **حجم التطبيق:** < 100 MB

### الأمان | Security
- تشفير جميع البيانات المحلية
- استخدام HTTPS فقط
- التحقق من شهادات SSL
- حماية من هجمات OWASP

### سهولة الاستخدام | Usability
- واجهة بديهية
- دعم اللغة العربية الكامل
- إمكانية الوصول (Accessibility)
- دعم الأجهزة المختلفة

## الدعم والصيانة | Support & Maintenance

### التحديثات المنتظمة | Regular Updates
- تحديثات الأمان الشهرية
- تحديثات الميزات كل ربع سنة
- إصلاح الأخطاء الفورية

### المراقبة | Monitoring
- تتبع الأخطاء (Crash Reporting)
- تحليلات الاستخدام
- مراقبة الأداء

## الموارد الإضافية | Additional Resources

- [دليل iOS Development](https://developer.apple.com/documentation/)
- [دليل Android Development](https://developer.android.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [REST API Documentation](./API_DOCUMENTATION.md)

---

**آخر تحديث | Last Updated:** 2026-02-18
**الإصدار | Version:** 1.0.0
