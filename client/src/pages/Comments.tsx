/**
 * Comments Component
 * نظام التعليقات والملاحظات المتقدم
 * 
 * الميزات:
 * - إضافة تعليقات جديدة
 * - الردود على التعليقات
 * - نظام التصويت (Like/Dislike)
 * - نظام الإشعارات
 * - دعم اللغة العربية (RTL)
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Trash2, Reply, Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface CommentType {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  replies: CommentType[];
  priority: 'low' | 'medium' | 'high';
  isLiked?: boolean;
  isDisliked?: boolean;
}

export default function Comments() {
  const [comments, setComments] = useState<CommentType[]>([
    {
      id: '1',
      author: 'أحمد محمد',
      content: 'هذا النظام رائع جداً ويوفر الكثير من الوقت والجهد',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 12,
      dislikes: 1,
      replies: [
        {
          id: '1-1',
          author: 'فاطمة علي',
          content: 'أتفق معك تماماً، الواجهة سهلة جداً',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          likes: 5,
          dislikes: 0,
          replies: [],
          priority: 'low',
        },
      ],
      priority: 'high',
    },
    {
      id: '2',
      author: 'محمود حسن',
      content: 'هل يمكن إضافة ميزة التصدير إلى Excel؟',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 8,
      dislikes: 0,
      replies: [],
      priority: 'medium',
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: CommentType = {
        id: Date.now().toString(),
        author: 'أنت',
        content: newComment,
        timestamp: new Date(),
        likes: 0,
        dislikes: 0,
        replies: [],
        priority: 'low',
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleLike = (id: string) => {
    setComments(comments.map(c => 
      c.id === id ? { ...c, likes: c.likes + 1, isLiked: !c.isLiked } : c
    ));
  };

  const handleDislike = (id: string) => {
    setComments(comments.map(c => 
      c.id === id ? { ...c, dislikes: c.dislikes + 1, isDisliked: !c.isDisliked } : c
    ));
  };

  const handleDelete = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
  };

  const filteredComments = comments.filter(c => {
    const matchesSearch = c.content.includes(searchQuery) || c.author.includes(searchQuery);
    const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return 'غير محددة';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">التعليقات والملاحظات</h1>
            <p className="text-muted-foreground mt-2">إدارة التعليقات والردود والملاحظات</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {comments.length} تعليق
          </Badge>
        </div>

        {/* Add Comment Section */}
        <Card className="p-6 border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">أضف تعليقك</h2>
          <div className="space-y-4">
            <Textarea
              placeholder="اكتب تعليقك هنا..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-24 resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNewComment('')}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                نشر التعليق
              </Button>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <Card className="p-6 border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 text-muted-foreground" size={20} />
              <Input
                placeholder="ابحث عن التعليقات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'low', 'medium', 'high'] as const).map(priority => (
                <Button
                  key={priority}
                  variant={filterPriority === priority ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPriority(priority)}
                >
                  {priority === 'all' ? 'الكل' : getPriorityLabel(priority)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.length > 0 ? (
            filteredComments.map(comment => (
              <Card key={comment.id} className="p-6 border-border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {comment.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{comment.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {comment.timestamp.toLocaleString('ar-JO')}
                      </p>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(comment.priority)}>
                    {getPriorityLabel(comment.priority)}
                  </Badge>
                </div>

                <p className="text-foreground mb-4 leading-relaxed">{comment.content}</p>

                {/* Interaction Buttons */}
                <div className="flex gap-4 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(comment.id)}
                    className={comment.isLiked ? 'text-red-500' : ''}
                  >
                    <Heart size={18} className="ml-2" />
                    {comment.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDislike(comment.id)}
                    className={comment.isDisliked ? 'text-blue-500' : ''}
                  >
                    <MessageCircle size={18} className="ml-2" />
                    {comment.dislikes}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Reply size={18} className="ml-2" />
                    رد
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 size={18} className="ml-2" />
                    مشاركة
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} className="ml-2" />
                    حذف
                  </Button>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="mt-4 pr-12 space-y-3 border-r-2 border-muted">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {reply.author.charAt(0)}
                          </div>
                          <p className="font-semibold text-sm text-foreground">{reply.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {reply.timestamp.toLocaleString('ar-JO')}
                          </p>
                        </div>
                        <p className="text-sm text-foreground">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center border-border">
              <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">لا توجد تعليقات حالياً</p>
              <p className="text-muted-foreground text-sm mt-2">كن أول من يعلق على هذا الموضوع</p>
            </Card>
          )}
        </div>

        {/* Statistics */}
        <Card className="p-6 border-border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <h3 className="text-lg font-semibold text-foreground mb-4">إحصائيات التعليقات</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{comments.length}</p>
              <p className="text-muted-foreground">إجمالي التعليقات</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {comments.filter(c => c.priority === 'high').length}
              </p>
              <p className="text-muted-foreground">تعليقات عالية الأولوية</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {comments.reduce((acc, c) => acc + c.likes, 0)}
              </p>
              <p className="text-muted-foreground">إجمالي الإعجابات</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {comments.reduce((acc, c) => acc + c.replies.length, 0)}
              </p>
              <p className="text-muted-foreground">إجمالي الردود</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
