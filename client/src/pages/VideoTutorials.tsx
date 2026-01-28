import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, Search, Clock, Users, ThumbsUp, Share2, 
  Bookmark, Eye, Filter 
} from 'lucide-react';

/**
 * صفحة الفيديوهات التعليمية
 */

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  category: string;
  views: number;
  likes: number;
  instructor: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  uploadDate: string;
  tags: string[];
}

export default function VideoTutorials() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const videos: Video[] = [
    {
      id: '1',
      title: 'البدء السريع مع النظام',
      description: 'تعرف على أساسيات النظام وكيفية البدء في 5 دقائق',
      thumbnail: '🚀',
      duration: 5,
      category: 'getting-started',
      views: 1250,
      likes: 980,
      instructor: 'أحمد محمد',
      difficulty: 'beginner',
      uploadDate: '2024-01-15',
      tags: ['بدء سريع', 'أساسيات'],
    },
    {
      id: '2',
      title: 'إنشاء أول بيان جمركي',
      description: 'خطوة بخطوة: كيفية إنشاء بيان جمركي صحيح',
      thumbnail: '📋',
      duration: 12,
      category: 'customs',
      views: 890,
      likes: 750,
      instructor: 'فاطمة علي',
      difficulty: 'beginner',
      uploadDate: '2024-01-14',
      tags: ['بيانات جمركية', 'إنشاء'],
    },
    {
      id: '3',
      title: 'تتبع الحاويات على الخريطة',
      description: 'استخدم الخريطة التفاعلية لتتبع حاويتك في الوقت الفعلي',
      thumbnail: '🗺️',
      duration: 8,
      category: 'tracking',
      views: 2100,
      likes: 1950,
      instructor: 'محمود حسن',
      difficulty: 'beginner',
      uploadDate: '2024-01-13',
      tags: ['تتبع', 'خريطة'],
    },
    {
      id: '4',
      title: 'إدارة الدفعات والفواتير',
      description: 'تعلم كيفية إجراء الدفعات بأمان وإدارة الفواتير',
      thumbnail: '💳',
      duration: 10,
      category: 'payments',
      views: 650,
      likes: 580,
      instructor: 'سارة محمود',
      difficulty: 'beginner',
      uploadDate: '2024-01-12',
      tags: ['دفع', 'فواتير'],
    },
    {
      id: '5',
      title: 'إنشاء التقارير المتقدمة',
      description: 'استخدم الفلاتر والخيارات المتقدمة لإنشاء تقارير شاملة',
      thumbnail: '📊',
      duration: 15,
      category: 'reports',
      views: 780,
      likes: 680,
      instructor: 'علي محمد',
      difficulty: 'intermediate',
      uploadDate: '2024-01-11',
      tags: ['تقارير', 'تحليل'],
    },
    {
      id: '6',
      title: 'البحث المتقدم والفلاتر',
      description: 'اتقن استخدام البحث المتقدم للعثور على البيانات بسرعة',
      thumbnail: '🔍',
      duration: 9,
      category: 'search',
      views: 520,
      likes: 450,
      instructor: 'ليلى أحمد',
      difficulty: 'intermediate',
      uploadDate: '2024-01-10',
      tags: ['بحث', 'فلاتر'],
    },
    {
      id: '7',
      title: 'تكامل النظام مع الأنظمة الخارجية',
      description: 'كيفية ربط النظام مع أنظمتك الأخرى عبر API',
      thumbnail: '🔗',
      duration: 20,
      category: 'advanced',
      views: 320,
      likes: 280,
      instructor: 'محمد علي',
      difficulty: 'advanced',
      uploadDate: '2024-01-09',
      tags: ['API', 'تكامل'],
    },
    {
      id: '8',
      title: 'نصائح الأمان والحماية',
      description: 'أفضل الممارسات لحماية حسابك والبيانات الحساسة',
      thumbnail: '🔒',
      duration: 11,
      category: 'security',
      views: 450,
      likes: 420,
      instructor: 'نور محمود',
      difficulty: 'beginner',
      uploadDate: '2024-01-08',
      tags: ['أمان', 'حماية'],
    },
  ];

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'getting-started', label: 'البدء السريع' },
    { id: 'customs', label: 'البيانات الجمركية' },
    { id: 'tracking', label: 'التتبع' },
    { id: 'payments', label: 'الدفع' },
    { id: 'reports', label: 'التقارير' },
    { id: 'search', label: 'البحث' },
    { id: 'advanced', label: 'متقدم' },
    { id: 'security', label: 'الأمان' },
  ];

  const filteredVideos = videos.filter(video => {
    const matchesSearch =
      video.title.includes(searchTerm) ||
      video.description.includes(searchTerm) ||
      video.tags.some(tag => tag.includes(searchTerm));
    const matchesCategory =
      selectedCategory === 'all' || video.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-900/20 text-green-400';
      case 'intermediate':
        return 'bg-yellow-900/20 text-yellow-400';
      case 'advanced':
        return 'bg-red-900/20 text-red-400';
      default:
        return 'bg-gray-900/20 text-gray-400';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      default:
        return 'عام';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-JO');
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
  };

  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* رأس الفيديو */}
          <button
            onClick={() => setSelectedVideo(null)}
            className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-1"
          >
            ← العودة للقائمة
          </button>

          {/* مشغل الفيديو */}
          <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video flex items-center justify-center">
            <div className="text-center">
              <Play className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
              <p className="text-gray-400">مشغل الفيديو</p>
            </div>
          </div>

          {/* معلومات الفيديو */}
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-2xl mb-2">
                    {selectedVideo.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {selectedVideo.description}
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 rounded ${getDifficultyColor(selectedVideo.difficulty)}`}>
                  {getDifficultyLabel(selectedVideo.difficulty)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* معلومات الفيديو */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">المدة</p>
                  <p className="text-white font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    {selectedVideo.duration} دقيقة
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">المشاهدات</p>
                  <p className="text-white font-semibold flex items-center gap-1">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    {formatViews(selectedVideo.views)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">الإعجابات</p>
                  <p className="text-white font-semibold flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4 text-cyan-400" />
                    {formatViews(selectedVideo.likes)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">تاريخ النشر</p>
                  <p className="text-white font-semibold">
                    {formatDate(selectedVideo.uploadDate)}
                  </p>
                </div>
              </div>

              {/* المدرب */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">المدرب</p>
                  <p className="text-white font-semibold">{selectedVideo.instructor}</p>
                </div>
              </div>

              {/* الوسوم */}
              <div className="pt-4 border-t border-slate-700">
                <p className="text-gray-400 text-sm mb-2">الوسوم</p>
                <div className="flex flex-wrap gap-2">
                  {selectedVideo.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-700 text-cyan-400 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  إعجاب
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  حفظ
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  مشاركة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            الفيديوهات التعليمية
          </h1>
          <p className="text-gray-400">
            تعلم من خلال مقاطع فيديو تفاعلية وشاملة
          </p>
        </div>

        {/* البحث والفلاتر */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="ابحث عن فيديو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-slate-800 border-slate-700 text-white placeholder-gray-500 text-lg py-6"
            />
          </div>

          {/* الفلاتر */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-gray-400 text-sm mb-2 block">الفئة</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded px-4 py-2"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-sm mb-2 block">المستوى</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded px-4 py-2"
              >
                <option value="all">الكل</option>
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </div>
          </div>
        </div>

        {/* قائمة الفيديوهات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <Card
              key={video.id}
              className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-all cursor-pointer overflow-hidden group"
              onClick={() => setSelectedVideo(video)}
            >
              {/* الصورة المصغرة */}
              <div className="relative bg-slate-700 aspect-video flex items-center justify-center overflow-hidden">
                <span className="text-5xl group-hover:scale-110 transition-transform">
                  {video.thumbnail}
                </span>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                  <Play className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.duration} دقيقة
                </div>
              </div>

              {/* المحتوى */}
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {video.description}
                </p>

                {/* المعلومات */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(video.difficulty)}`}>
                    {getDifficultyLabel(video.difficulty)}
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViews(video.views)}
                  </span>
                </div>

                {/* المدرب */}
                <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{video.instructor}</span>
                  <span className="text-gray-400 text-xs">
                    {formatDate(video.uploadDate)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              لم يتم العثور على فيديوهات مطابقة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
