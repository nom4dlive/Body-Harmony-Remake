import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaVideo, FaLink, FaGripVertical, FaCheck, FaArrowLeft, FaPlay, FaSave, FaQuestionCircle, FaBook, FaSync } from 'react-icons/fa';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    TouchSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import LMSService from '../../../services/LMSService';
import ChunkUploader from '../../../components/Admin/ChunkUploader';
import MediaUploadField from '../../../components/MediaBrowser/MediaUploadField';
import AdminVideoPlayer from './components/AdminVideoPlayer';
import QuickActionsMenu from './components/QuickActionsMenu';
import HlsConvertButton from './components/HlsConvertButton';
import HlsBatchConverter from './components/HlsBatchConverter';
import ThumbnailsBatchConverter from './components/ThumbnailsBatchConverter';


const StudioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  min-height: 48px;
  border: none;
  font-family: inherit;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: #ED7E13;
  color: white;
  box-shadow: 0 4px 12px rgba(237, 126, 19, 0.2);

  &:hover:not(:disabled) {
    background: #FF8F26;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(237, 126, 19, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    background: #D56A0C;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: transparent;
  color: #316B9C;
  border: 2px solid #316B9C;

  &:hover:not(:disabled) {
    background: rgba(49, 107, 156, 0.05);
  }

  &:active:not(:disabled) {
    background: rgba(49, 107, 156, 0.1);
  }
`;

const ModuleCard = styled.div`
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }
`;

const ModuleHeader = styled.div`
  background: #F8FAFC;
  padding: 1.2rem;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    .actions {
      align-self: flex-end;
      opacity: 1; // Always show actions on mobile
    }
  }

  h3 {
    margin: 0;
    color: #0F172A;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  &:hover .actions {
    opacity: 1;
  }
`;

const LessonsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LessonItem = styled.li`
  padding: 1rem 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F1F5F9;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #F8FAFC;
  }

  .info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .type-badge {
    background: ${props => props.$isInternal ? '#E0F2FE' : '#FEF3C7'};
    color: ${props => props.$isInternal ? '#0284C7' : '#D97706'};
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    
    .info {
      width: 100%;
      flex-wrap: wrap;
    }
  }
`;

const AddLessonButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  border-top: 1px dashed #E2E8F0;
  color: #64748B;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #F8FAFC;
    color: #00BFA5;
  }
`;

const DragHandle = styled.div`
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: #CBD5E1;
  transition: color 0.2s;
  
  &:hover {
    color: #94A3B8;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const ReorderBar = styled.div`
  position: sticky;
  top: 1rem;
  z-index: 100;
  background: #0A3E60;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px rgba(10, 62, 96, 0.3);
  margin-bottom: 1rem;
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

// Simple Modal Component (Inline for simplicity)
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 90%; // Responsive width
  max-width: 550px;
  max-height: 90vh; // Prevent overflow
  overflow-y: auto; // Scrollable
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 95%;
  }

  h2 { 
    margin-top: 0; 
    color: #0A3E60; 
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.875rem 1rem;
    margin-bottom: 1.5rem;
    border: 1.5px solid #E2E8F0;
    border-radius: 12px;
    font-family: inherit;
    font-size: 0.95rem;
    transition: all 0.2s;
    background: #F8FAFC;

    &:focus {
      outline: none;
      border-color: #316B9C;
      background: white;
      box-shadow: 0 0 0 4px rgba(49, 107, 156, 0.1);
    }
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }
`;

const SortableModule = ({ module, children, onEdit, onDelete, onManageQuiz }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: module.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 2 : 1,
        position: 'relative'
    };

    return (
        <ModuleCard ref={setNodeRef} style={style}>
            <ModuleHeader>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DragHandle {...attributes} {...listeners}>
                        <FaGripVertical />
                    </DragHandle>
                    <div>
                        <h3>{module.title}</h3>
                        {module.description && <small style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>{module.description}</small>}
                    </div>
                </div>
                <div className="actions">
                    <button 
                        onClick={() => onManageQuiz(module)} 
                        style={{ color: '#ED7E13', background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }} 
                        title="Gerenciar Quiz"
                    >
                        <FaQuestionCircle />
                    </button>
                    <button onClick={() => onEdit(module)} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}><FaEdit /></button>
                    <button onClick={() => onDelete(module.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button>
                </div>
            </ModuleHeader>
            {children}
        </ModuleCard>
    );
};

const SortableLesson = ({ lesson, onPreview, onEdit, onDelete, onRetranscribe }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? '#F1F5F9' : undefined
    };

    const renderTranscriptionBadge = () => {
        if (lesson.video_type !== 'hostinger' || !lesson.video_ref) return null;

        const status = lesson.transcription_status || 'PENDING';

        switch (status) {
            case 'COMPLETED':
                return (
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#059669',
                            border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}
                        title="SmartBook: Transcrição verbatim vinculada"
                    >
                        <FaBook style={{ fontSize: '0.68rem' }} /> SmartBook
                    </span>
                );
            case 'PROCESSING':
                return (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRetranscribe && onRetranscribe(lesson.id); }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(237, 126, 19, 0.12)',
                            color: '#ED7E13',
                            border: '1px solid rgba(237, 126, 19, 0.3)',
                            cursor: 'pointer'
                        }}
                        title="Clique para sincronizar com o SmartBook agora"
                    >
                        <FaSync style={{ fontSize: '0.68rem' }} /> Sincronizar SmartBook
                    </button>
                );
            case 'FAILED':
                return (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRetranscribe && onRetranscribe(lesson.id); }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#DC2626',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            cursor: 'pointer'
                        }}
                        title={lesson.transcription_error || 'Falha na transcrição. Clique para tentar novamente.'}
                    >
                        <FaSync style={{ fontSize: '0.68rem' }} /> Erro (Tentar)
                    </button>
                );
            default:
                return (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRetranscribe && onRetranscribe(lesson.id); }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(10, 62, 96, 0.08)',
                            color: '#0A3E60',
                            border: '1px solid rgba(10, 62, 96, 0.2)',
                            cursor: 'pointer'
                        }}
                        title="Vincular ao SmartBook & Dra. Harmony AI"
                    >
                        <FaSync style={{ fontSize: '0.68rem' }} /> Transcrever
                    </button>
                );
        }
    };

    return (
        <LessonItem
            ref={setNodeRef}
            style={style}
            $isInternal={lesson.video_type === 'hostinger'}
        >
            <div className="info">
                <DragHandle {...attributes} {...listeners} style={{ padding: '4px' }}>
                    <FaGripVertical fontSize="0.8rem" />
                </DragHandle>
                <span className="type-badge">
                    {lesson.video_type === 'hostinger' ? <FaVideo /> : <FaLink />}
                </span>
                <span>{lesson.title}</span>
                {renderTranscriptionBadge()}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => onPreview(lesson)} style={{ color: '#10B981', border: 'none', background: 'none', cursor: 'pointer' }} title="Visualizar Aula">
                    <FaPlay />
                </button>
                <button onClick={() => onEdit(lesson)} style={{ color: '#94A3B8', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <FaEdit />
                </button>
                <button onClick={() => onDelete(lesson.id)} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <FaTrash />
                </button>
                <QuickActionsMenu lesson={lesson} onRename={() => onEdit(lesson)} />
            </div>
        </LessonItem>
    );
};

const LMSStudio = () => {
    const [modules, setModules] = useState([]);
    const [originalModules, setOriginalModules] = useState([]); // For change detection
    const [loading, setLoading] = useState(true);
    const [savingOrder, setSavingOrder] = useState(false);

    // Quiz State (V128)
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizModule, setQuizModule] = useState(null);
    const [quizId, setQuizId] = useState(null);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizMinScore, setQuizMinScore] = useState(70);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [savingQuiz, setSavingQuiz] = useState(false);

    // Modals & Form State
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [previewLesson, setPreviewLesson] = useState(null); // For Video Preview
    const [currentModule, setCurrentModule] = useState(null);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [targetModuleId, setTargetModuleId] = useState(null);
    const [isReordered, setIsReordered] = useState(false);

    // Form Data
    const [moduleTitle, setModuleTitle] = useState('');
    const [moduleDesc, setModuleDesc] = useState('');
    const [moduleExclusive, setModuleExclusive] = useState(false);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDesc, setLessonDesc] = useState('');
    const [videoType, setVideoType] = useState('hostinger');
    const [videoRef, setVideoRef] = useState('');
    const [thumbnailRef, setThumbnailRef] = useState('');

    // File Management State (V24)
    const [fileInfo, setFileInfo] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [renaming, setRenaming] = useState(false);
    const [pendingVideoFile, setPendingVideoFile] = useState(null);

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Quiz Builder Logic (V128)
    const openQuizModal = async (module) => {
        setQuizModule(module);
        setQuizId(null);
        setQuizTitle(`Avaliação – ${module.title}`);
        setQuizMinScore(70);
        setQuizQuestions([]);
        setShowQuizModal(true);

        try {
            const data = await LMSService.getQuiz(module.id);
            if (data && data.quiz) {
                setQuizId(data.quiz.id);
                setQuizTitle(data.quiz.title);
                setQuizMinScore(data.quiz.min_score);
                setQuizQuestions(data.questions || []);
            }
        } catch (error) {
            console.error('Erro ao carregar quiz:', error);
        }
    };

    const handleAddQuestion = () => {
        setQuizQuestions([...quizQuestions, {
            id: null,
            text: '',
            type: 'single_choice',
            options: [
                { text: '', is_correct: false },
                { text: '', is_correct: false }
            ]
        }]);
    };

    const handleRemoveQuestion = (qIdx) => {
        setQuizQuestions(quizQuestions.filter((_, idx) => idx !== qIdx));
    };

    const handleQuestionTextChange = (qIdx, text) => {
        const updated = [...quizQuestions];
        updated[qIdx].text = text;
        setQuizQuestions(updated);
    };

    const handleQuestionTypeChange = (qIdx, type) => {
        const updated = [...quizQuestions];
        updated[qIdx].type = type;
        setQuizQuestions(updated);
    };

    const handleAddOption = (qIdx) => {
        const updated = [...quizQuestions];
        updated[qIdx].options.push({ text: '', is_correct: false });
        setQuizQuestions(updated);
    };

    const handleRemoveOption = (qIdx, optIdx) => {
        const updated = [...quizQuestions];
        updated[qIdx].options = updated[qIdx].options.filter((_, idx) => idx !== optIdx);
        setQuizQuestions(updated);
    };

    const handleOptionTextChange = (qIdx, optIdx, text) => {
        const updated = [...quizQuestions];
        updated[qIdx].options[optIdx].text = text;
        setQuizQuestions(updated);
    };

    const handleOptionCorrectChange = (qIdx, optIdx) => {
        const updated = [...quizQuestions];
        if (updated[qIdx].type === 'single_choice') {
            updated[qIdx].options = updated[qIdx].options.map((opt, idx) => ({
                ...opt,
                is_correct: idx === optIdx ? 1 : 0
            }));
        } else {
            updated[qIdx].options[optIdx].is_correct = updated[qIdx].options[optIdx].is_correct ? 0 : 1;
        }
        setQuizQuestions(updated);
    };

    const handleSaveQuiz = async () => {
        if (!quizTitle.trim()) {
            alert('Por favor, informe o título do quiz.');
            return;
        }

        // Validate questions
        for (let i = 0; i < quizQuestions.length; i++) {
            const q = quizQuestions[i];
            if (!q.text.trim()) {
                alert(`A pergunta ${i + 1} está sem enunciado.`);
                return;
            }
            if (q.options.length < 2) {
                alert(`A pergunta ${i + 1} precisa de pelo menos 2 alternativas.`);
                return;
            }
            const hasCorrect = q.options.some(opt => opt.is_correct == 1);
            if (!hasCorrect) {
                alert(`A pergunta ${i + 1} não tem nenhuma resposta marcada como correta.`);
                return;
            }
            for (let j = 0; j < q.options.length; j++) {
                if (!q.options[j].text.trim()) {
                    alert(`A alternativa ${j + 1} da pergunta ${i + 1} está em branco.`);
                    return;
                }
            }
        }

        setSavingQuiz(true);
        try {
            const payload = {
                module_id: quizModule.id,
                title: quizTitle,
                min_score: parseInt(quizMinScore) || 70,
                questions: quizQuestions.map((q, idx) => ({
                    ...q,
                    order_index: idx
                }))
            };

            await LMSService.saveQuiz(payload);
            alert('Quiz salvo com sucesso!');
            setShowQuizModal(false);
            loadModules();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar quiz');
        } finally {
            setSavingQuiz(false);
        }
    };

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        setLoading(true);
        try {
            const data = await LMSService.getModules();
            setModules(data || []);
            setOriginalModules(JSON.parse(JSON.stringify(data || [])));
            setIsReordered(false);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar módulos');
        } finally {
            setLoading(false);
        }
    };

    const checkIfReordered = (current) => {
        const originalStr = JSON.stringify(originalModules.map(m => ({
            id: m.id,
            lessons: m.lessons.map(l => l.id)
        })));
        const currentStr = JSON.stringify(current.map(m => ({
            id: m.id,
            lessons: m.lessons.map(l => l.id)
        })));
        setIsReordered(originalStr !== currentStr);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Determine if we are dragging a module or a lesson
        const activeId = active.id;
        const overId = over.id;

        const activeModule = modules.find(m => m.id === activeId);
        const overModule = modules.find(m => m.id === overId);

        if (activeModule && overModule) {
            // Reordering modules
            setModules((items) => {
                const oldIndex = items.findIndex(m => m.id === activeId);
                const newIndex = items.findIndex(m => m.id === overId);
                const newItems = arrayMove(items, oldIndex, newIndex);
                checkIfReordered(newItems);
                return newItems;
            });
        } else {
            // Reordering lessons within a module
            setModules((items) => {
                const newItems = items.map(mod => {
                    const lessons = mod.lessons || [];
                    const activeIndex = lessons.findIndex(l => l.id === activeId);
                    const overIndex = lessons.findIndex(l => l.id === overId);

                    if (activeIndex !== -1 && overIndex !== -1) {
                        return {
                            ...mod,
                            lessons: arrayMove(lessons, activeIndex, overIndex)
                        };
                    }
                    return mod;
                });
                checkIfReordered(newItems);
                return newItems;
            });
        }
    };

    const handleSaveChanges = async () => {
        setSavingOrder(true);
        try {
            // 1. Save Modules Order
            const moduleIds = modules.map(m => m.id);
            await LMSService.reorderModules(moduleIds);

            // 2. Save Lessons Order for each module
            for (const mod of modules) {
                const lessonIds = mod.lessons.map(l => l.id);
                await LMSService.reorderLessons(lessonIds);
            }

            alert('Ordem salva com sucesso!');
            setOriginalModules(JSON.parse(JSON.stringify(modules)));
            setIsReordered(false);
        } catch (error) {
            alert('Erro ao salvar nova ordem');
        } finally {
            setSavingOrder(false);
        }
    };

    // --- MODULE ACTIONS ---
    const openModuleModal = (module = null) => {
        if (module) {
            setCurrentModule(module);
            setModuleTitle(module.title);
            setModuleDesc(module.description || '');
            setModuleExclusive(!!module.is_exclusive);
        } else {
            setCurrentModule(null);
            setModuleTitle('');
            setModuleDesc('');
            setModuleExclusive(false);
        }
        setShowModuleModal(true);
    };

    const handleSaveModule = async () => {
        try {
            const payload = {
                title: moduleTitle,
                description: moduleDesc,
                is_exclusive: moduleExclusive ? 1 : 0
            };
            if (currentModule) {
                await LMSService.updateModule({ id: currentModule.id, ...payload });
            } else {
                await LMSService.createModule(payload);
            }
            setShowModuleModal(false);
            loadModules();
        } catch (e) {
            alert('Erro ao salvar módulo');
        }
    };

    const handleDeleteModule = async (id) => {
        if (confirm('Tem certeza? Todas as aulas serão apagadas!')) {
            await LMSService.deleteModule(id);
            loadModules();
        }
    };

    // --- LESSON ACTIONS ---
    const openLessonModal = (moduleId, lesson = null) => {
        setTargetModuleId(moduleId);
        if (lesson) {
            setCurrentLesson(lesson);
            setLessonTitle(lesson.title);
            setLessonDesc(lesson.description || '');
            setVideoType(lesson.video_type);
            setVideoRef(lesson.video_ref || '');
            setThumbnailRef(lesson.thumbnail_ref || '');
        } else {
            setCurrentLesson(null);
            setLessonTitle('');
            setLessonDesc('');
            setVideoType('hostinger');
            setVideoRef('');
            setThumbnailRef('');
        }
        setShowLessonModal(true);

        // Fetch File Info if Hostinger
        if (lesson && lesson.video_type === 'hostinger') {
            setFileInfo(null); // Reset
            LMSService.getFileInfo(lesson.id).then(info => {
                setFileInfo(info);
                if (info.exists) {
                    // Extract filename without extension for rename input
                    const name = info.filename.substring(0, info.filename.lastIndexOf('.')) || info.filename;
                    setRenameValue(name);
                }
            }).catch(console.error);
        } else {
            setFileInfo(null);
        }
    };

    const handleRenameFile = async () => {
        if (!currentLesson || !renameValue) return;
        if (!confirm('Renomear o arquivo pode quebrar links externos se não atualizados. Confirmar?')) return;

        setRenaming(true);
        try {
            const res = await LMSService.renameFile(currentLesson.id, renameValue);
            alert('Arquivo renomeado com sucesso!');
            // Update local state
            setVideoRef(res.new_name);
            // Refresh info
            const newInfo = await LMSService.getFileInfo(currentLesson.id);
            setFileInfo(newInfo);
            loadModules(); // Refresh list to update any refs
        } catch (error) {
            alert('Erro ao renomear: ' + error.message);
        } finally {
            setRenaming(false);
        }
    };

    const handleSaveLesson = async () => {
        try {
            const payload = {
                module_id: targetModuleId,
                title: lessonTitle,
                description: lessonDesc,
                video_type: videoType,
                video_ref: videoRef,
                thumbnail_ref: thumbnailRef
            };

            if (currentLesson) {
                payload.id = currentLesson.id;
                await LMSService.updateLesson(payload);
            } else {
                await LMSService.createLesson(payload);
            }
            setShowLessonModal(false);
            loadModules();
        } catch (e) {
            alert('Erro ao salvar aula');
        }
    };

    const handleDeleteLesson = async (id) => {
        if (confirm('Apagar aula?')) {
            await LMSService.deleteLesson(id);
            loadModules();
        }
    };

    const handleRetranscribeLesson = async (id) => {
        try {
            await LMSService.retranscribeLesson(id);
            alert('Processamento de transcrição reiniciado! O SmartBook será atualizado em instantes.');
            loadModules();
        } catch (e) {
            alert('Erro ao reiniciar transcrição: ' + (e.message || 'Falha na conexão'));
        }
    };

    return (
        <StudioContainer>
            <HlsBatchConverter />
            <ThumbnailsBatchConverter />
            {isReordered && (
                <ReorderBar>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FaSave fontSize="1.2rem" />
                        <div>
                            <strong style={{ display: 'block' }}>Ordem alterada</strong>
                            <small style={{ opacity: 0.8 }}>Clique em salvar para persistir as mudanças.</small>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <SecondaryButton
                            onClick={loadModules}
                            style={{ borderColor: 'white', color: 'white', minHeight: '40px', padding: '0 1rem' }}
                        >
                            DESCARTAR
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleSaveChanges}
                            disabled={savingOrder}
                            style={{ background: 'white', color: '#0A3E60', minHeight: '40px', padding: '0 1rem' }}
                        >
                            {savingOrder ? 'SALVANDO...' : 'SALVAR ORDEM'}
                        </PrimaryButton>
                    </div>
                </ReorderBar>
            )}

            <PrimaryButton onClick={() => openModuleModal()} style={{ alignSelf: 'flex-end' }}>
                <FaPlus /> NOVO MÓDULO
            </PrimaryButton>

            {loading ? (
                <div style={{ textAlign: 'center', color: '#64748B' }}>Carregando conteúdo...</div>
            ) : (
                modules.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                        <h3 style={{ color: '#0A3E60' }}>Comece o seu curso</h3>
                        <p style={{ color: '#64748B' }}>Você ainda não criou nenhum módulo.</p>
                        <br />
                        <ActionButton onClick={() => openModuleModal()} style={{ margin: '0 auto' }}>
                            + Criar Primeiro Módulo
                        </ActionButton>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext
                            items={modules.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {modules.map(mod => (
                                <SortableModule
                                    key={mod.id}
                                    module={mod}
                                    onEdit={openModuleModal}
                                    onDelete={handleDeleteModule}
                                    onManageQuiz={openQuizModal}
                                >
                                    <LessonsList>
                                        <SortableContext
                                            items={(mod.lessons || []).map(l => l.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {(mod.lessons || []).map(lesson => (
                                                <SortableLesson
                                                    key={lesson.id}
                                                    lesson={lesson}
                                                    onPreview={setPreviewLesson}
                                                    onEdit={(l) => openLessonModal(mod.id, l)}
                                                    onDelete={handleDeleteLesson}
                                                    onRetranscribe={handleRetranscribeLesson}
                                                />
                                            ))}
                                        </SortableContext>
                                        <AddLessonButton onClick={() => openLessonModal(mod.id)}>
                                            <FaPlus /> Adicionar Aula
                                        </AddLessonButton>
                                    </LessonsList>
                                </SortableModule>
                            ))}
                        </SortableContext>
                    </DndContext>
                )
            )}

            {/* MODULE MODAL */}
            {showModuleModal && (
                <ModalOverlay onClick={(e) => e.target === e.currentTarget && setShowModuleModal(false)}>
                    <ModalContent>
                        <h2>{currentModule ? 'Editar Módulo' : 'Novo Módulo'}</h2>
                        <input
                            placeholder="Ex: Módulo 1 – Introdução ao Body Harmony"
                            value={moduleTitle}
                            onChange={e => setModuleTitle(e.target.value)}
                            autoFocus
                        />
                        <textarea
                            placeholder="Descrição curta do módulo"
                            value={moduleDesc}
                            onChange={e => setModuleDesc(e.target.value)}
                            rows="3"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setModuleExclusive(!moduleExclusive)}>
                            <input
                                type="checkbox"
                                checked={moduleExclusive}
                                onChange={(e) => setModuleExclusive(e.target.checked)}
                                style={{ width: '20px', height: '20px', margin: 0, cursor: 'pointer' }}
                            />
                            <label style={{ margin: 0, cursor: 'pointer', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>
                                Módulo Exclusivo (Requer autorização do gestor)
                            </label>
                        </div>
                        <div className="buttons">
                            <SecondaryButton onClick={() => setShowModuleModal(false)}>
                                <FaArrowLeft /> CANCELAR
                            </SecondaryButton>
                            <PrimaryButton onClick={handleSaveModule}>
                                <FaCheck /> SALVAR MÓDULO
                            </PrimaryButton>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* LESSON MODAL */}
            {showLessonModal && (
                <ModalOverlay onClick={(e) => e.target === e.currentTarget && setShowLessonModal(false)}>
                    <ModalContent>
                        <h2>{currentLesson ? 'Editar Aula' : 'Nova Aula'}</h2>
                        <input
                            placeholder="Ex: Aula 1 – Boas-vindas e visão geral"
                            value={lessonTitle}
                            onChange={e => setLessonTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Descrição do conteúdo"
                            value={lessonDesc}
                            onChange={e => setLessonDesc(e.target.value)}
                            rows="3"
                        />

                        {/* Capa da Aula */}
                        <MediaUploadField
                            category="thumbnail"
                            label="Capa da Aula (Thumbnail)"
                            value={thumbnailRef ? {
                                type: 'existing',
                                path: thumbnailRef,
                                name: thumbnailRef.split('/').pop(),
                                preview: (thumbnailRef.startsWith('http') || thumbnailRef.startsWith('data:') || thumbnailRef.startsWith('blob:'))
                                    ? thumbnailRef
                                    : `${import.meta.env.VITE_API_BASE || '/api'}/v1/lms/thumbnail/${thumbnailRef.split('/').pop()}`
                            } : null}
                            onChange={(media) => {
                                if (media) {
                                    // Handle both upload and existing file selection
                                    if (media.type === 'upload') {
                                        // For new uploads, we'll upload the file
                                        LMSService.uploadThumbnail(media.file)
                                            .then(response => setThumbnailRef(response.path))
                                            .catch(err => {
                                                console.error('Upload failed:', err);
                                                alert('Erro ao enviar thumbnail');
                                            });
                                    } else {
                                        // For existing files, just use the path
                                        setThumbnailRef(media.path);
                                    }
                                } else {
                                    setThumbnailRef('');
                                }
                            }}
                        />

                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Vídeo da Aula</label>
                        <select value={videoType} onChange={e => { setVideoType(e.target.value); if (e.target.value !== 'hostinger') setVideoRef(''); }}>
                            <option value="hostinger">Biblioteca de Mídias / Upload (Hostinger)</option>
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                        </select>

                        {videoType === 'hostinger' ? (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <MediaUploadField
                                    category="all"
                                    type="video"
                                    label="Selecionar Vídeo"
                                    value={videoRef ? {
                                        type: 'existing',
                                        path: videoRef,
                                        name: videoRef.split('/').pop()
                                    } : null}
                                    onChange={(media) => {
                                        if (media) {
                                            if (media.type === 'existing') {
                                                setVideoRef(media.path);
                                            } else {
                                                // It's a new file, we need to show ChunkUploader
                                                // We'll store it in a temp state
                                                setPendingVideoFile(media.file);
                                                setVideoRef(''); // Clear previous until upload starts
                                            }
                                        } else {
                                            setVideoRef('');
                                            setPendingVideoFile(null);
                                        }
                                    }}
                                />

                                {pendingVideoFile && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <ChunkUploader
                                            initialFile={pendingVideoFile}
                                            onUploadComplete={(res) => {
                                                setVideoRef(res.filename);
                                                setPendingVideoFile(null);
                                            }}
                                        />
                                    </div>
                                )}

                                {/* FILE MANAGEMENT SECTION (V24) */}
                                {currentLesson && videoRef && fileInfo && (
                                    <div style={{ marginTop: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Gerenciar Arquivo Físico</span>
                                            {fileInfo.exists && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{fileInfo.size_mb} MB • {fileInfo.mime}</span>}
                                        </label>

                                        {fileInfo.exists ? (
                                            <>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                    <input
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        placeholder="Nome do arquivo"
                                                        style={{ marginBottom: 0, padding: '8px', fontSize: '0.9rem' }}
                                                    />
                                                    <button
                                                        onClick={handleRenameFile}
                                                        disabled={renaming || !renameValue || renameValue === fileInfo.filename.split('.')[0]}
                                                        style={{
                                                            background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px',
                                                            padding: '0 12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                                            opacity: (renaming || !renameValue) ? 0.6 : 1
                                                        }}
                                                    >
                                                        {renaming ? '...' : 'Renomear'}
                                                    </button>
                                                </div>
                                                <div style={{ marginTop: '0.75rem' }}>
                                                    <HlsConvertButton lesson={currentLesson} />
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '4px' }}>
                                                ⚠️ Arquivo físico não encontrado no servidor. Faça upload novamente.
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                                            Original: {fileInfo.filename}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <input
                                placeholder="ID do Vídeo ou URL"
                                value={videoRef}
                                onChange={e => setVideoRef(e.target.value)}
                            />
                        )}

                        <div className="buttons">
                            <SecondaryButton onClick={() => setShowLessonModal(false)}>
                                <FaArrowLeft /> CANCELAR
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={handleSaveLesson}
                                disabled={!lessonTitle || !videoRef}
                            >
                                <FaCheck /> SALVAR AULA
                            </PrimaryButton>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
            {/* LESSON PREVIEW MODAL */}
            {previewLesson && (
                <ModalOverlay onClick={(e) => e.target === e.currentTarget && setPreviewLesson(null)}>
                    <ModalContent style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Preview: {previewLesson.title}</h2>
                            <button onClick={() => setPreviewLesson(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748B' }}>&times;</button>
                        </div>

                        <AdminVideoPlayer lesson={previewLesson} />

                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.9rem', color: '#475569' }}>
                            <strong>Descrição:</strong>
                            <p style={{ margin: '0.5rem 0 0 0' }}>{previewLesson.description || 'Sem descrição.'}</p>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* QUIZ BUILDER MODAL (V128) */}
            {showQuizModal && (
                <ModalOverlay onClick={(e) => e.target === e.currentTarget && setShowQuizModal(false)}>
                    <ModalContent style={{ maxWidth: '700px', width: '95%' }}>
                        <h2>
                            <FaQuestionCircle style={{ color: '#ED7E13' }} /> 
                            {quizId ? 'Editar Quiz' : 'Criar Quiz'} – {quizModule?.title}
                        </h2>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1', minWidth: '250px' }}>
                                <label>Título da Avaliação</label>
                                <input
                                    placeholder="Ex: Avaliação do Módulo 1"
                                    value={quizTitle}
                                    onChange={e => setQuizTitle(e.target.value)}
                                />
                            </div>
                            <div style={{ width: '120px' }}>
                                <label>Nota de Corte (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={quizMinScore}
                                    onChange={e => setQuizMinScore(e.target.value)}
                                />
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '1.5rem 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0A3E60' }}>Perguntas ({quizQuestions.length})</h3>
                            <SecondaryButton onClick={handleAddQuestion} style={{ minHeight: '38px', padding: '0 1rem' }}>
                                <FaPlus /> Adicionar Pergunta
                            </SecondaryButton>
                        </div>

                        {quizQuestions.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', marginBottom: '1.5rem' }}>
                                <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Nenhuma pergunta adicionada ainda. Adicione uma para começar o quiz.</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
                                {quizQuestions.map((q, qIdx) => (
                                    <div key={qIdx} style={{ padding: '1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', position: 'relative' }}>
                                        <button 
                                            onClick={() => handleRemoveQuestion(qIdx)} 
                                            style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
                                            title="Remover Pergunta"
                                        >
                                            <FaTrash />
                                        </button>
                                        
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingRight: '2rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.8rem', color: '#64748B' }}>Pergunta {qIdx + 1}</label>
                                                <input
                                                    placeholder="Enunciado da pergunta..."
                                                    value={q.text}
                                                    onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            </div>
                                            <div style={{ width: '150px' }}>
                                                <label style={{ fontSize: '0.8rem', color: '#64748B' }}>Tipo</label>
                                                <select 
                                                    value={q.type} 
                                                    onChange={e => handleQuestionTypeChange(qIdx, e.target.value)}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <option value="single_choice">Escolha Única</option>
                                                    <option value="multiple_choice">Escolha Múltipla</option>
                                                </select>
                                            </div>
                                        </div>

                                        <label style={{ fontSize: '0.8rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>Alternativas</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            {q.options.map((opt, optIdx) => (
                                                <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type={q.type === 'single_choice' ? 'radio' : 'checkbox'}
                                                        name={`correct-ans-${qIdx}-${optIdx}`}
                                                        checked={opt.is_correct == 1}
                                                        onChange={() => handleOptionCorrectChange(qIdx, optIdx)}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer', margin: 0 }}
                                                        title="Marcar como correta"
                                                    />
                                                    <input
                                                        placeholder={`Alternativa ${optIdx + 1}`}
                                                        value={opt.text}
                                                        onChange={e => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                                                        style={{ marginBottom: 0, flex: 1, padding: '8px 12px', fontSize: '0.875rem' }}
                                                    />
                                                    {q.options.length > 2 && (
                                                        <button 
                                                            onClick={() => handleRemoveOption(qIdx, optIdx)} 
                                                            style={{ border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                                                            title="Remover Alternativa"
                                                        >
                                                            &times;
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleAddOption(qIdx)} 
                                            style={{ background: 'none', border: 'none', color: '#316B9C', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                                        >
                                            + Adicionar Alternativa
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="buttons" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>
                            <SecondaryButton onClick={() => setShowQuizModal(false)}>
                                <FaArrowLeft /> CANCELAR
                            </SecondaryButton>
                            <PrimaryButton onClick={handleSaveQuiz} disabled={savingQuiz}>
                                <FaCheck /> {savingQuiz ? 'SALVANDO...' : 'SALVAR AVALIAÇÃO'}
                            </PrimaryButton>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </StudioContainer>
    );
};

export default LMSStudio;
