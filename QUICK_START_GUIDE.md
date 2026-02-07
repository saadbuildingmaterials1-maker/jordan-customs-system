# 🚀 دليل البدء السريع

## ⚡ الخطوات الفورية (5 دقائق)

### 1️⃣ متابعة البناء الأول

```
اذهب إلى:
https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/actions

اختر:
"بناء مثبت Windows الاحترافي"

تحقق من:
✅ الحالة: Passed (أخضر)
✅ Artifacts موجود
✅ حمل الملفات
```

---

### 2️⃣ إعداد Slack Webhook (اختياري - 5 دقائق)

```bash
# 1. اذهب إلى Slack
https://api.slack.com/apps

# 2. أنشئ Incoming Webhook

# 3. انسخ الـ URL

# 4. أضفه إلى GitHub Secrets:
https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/settings/secrets/actions

# Name: SLACK_WEBHOOK
# Value: [الـ URL]
```

---

### 3️⃣ اختبار على Windows VM (30 دقيقة)

```
1. حمل الملفات من GitHub Actions
2. شغل JordanCustomsSystem-Setup-*.exe
3. اتبع خطوات التثبيت
4. تحقق من الاختصارات
5. شغل التطبيق
6. سجل النتائج في BUILD_AND_TEST_TRACKING.md
```

---

### 4️⃣ نشر GitHub Wiki (20 دقيقة)

```
1. اذهب إلى GitHub Settings
2. فعّل Wikis
3. أنشئ صفحات من GITHUB_WIKI_SETUP.md
4. أضف صور
5. أضف FAQs
```

---

### 5️⃣ إصدار النسخة الأولى (5 دقائق)

```bash
cd /home/ubuntu/jordan-customs-system
git tag v1.0.1
git push origin v1.0.1
```

---

## 📊 جدول المتابعة السريع

| الخطوة | الحالة | الوقت |
|--------|--------|------|
| 1️⃣ متابعة البناء | [ ] مكتمل | 5 دقائق |
| 2️⃣ Slack Webhook | [ ] مكتمل | 5 دقائق |
| 3️⃣ اختبار Windows | [ ] مكتمل | 30 دقيقة |
| 4️⃣ GitHub Wiki | [ ] مكتمل | 20 دقيقة |
| 5️⃣ إصدار النسخة | [ ] مكتمل | 5 دقائق |

---

## 🔗 الروابط المهمة

```
GitHub Actions:
https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/actions

GitHub Secrets:
https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/settings/secrets/actions

GitHub Wiki:
https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/wiki

GitHub Releases:
https://github.com/saadbuildingmaterials1-maker/jordan-customs-system/releases
```

---

## ✅ بعد الانتهاء

- [ ] جميع الخطوات مكتملة
- [ ] البناء ناجح
- [ ] الاختبار ناجح
- [ ] Wiki منشور
- [ ] الإصدار جاهز
- [ ] النظام مراقب

---

**🎉 تم! النظام جاهز للاستخدام! 🎉**
