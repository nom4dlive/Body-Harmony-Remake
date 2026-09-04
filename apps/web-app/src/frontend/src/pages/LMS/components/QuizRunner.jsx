import React, { useState, useEffect } from 'react';
import LMSService from '../../../services/LMSService';

export default function QuizRunner({ moduleId, onComplete, onCancel }) {
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({}); // { question_id: option_id }
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        loadQuiz();
    }, [moduleId]);

    const loadQuiz = async () => {
        try {
            const data = await LMSService.getStudentQuiz(moduleId); // We need to add this method or reuse getQuiz but endpoint differs?
            // Re-checking QuizController: 
            // Admin: GET /admin/quiz
            // Student: GET /lms/quiz
            // Service currently has getQuiz -> /admin/quiz. I need to add getStudentQuiz -> /lms/quiz
            // Wait, I haven't added getStudentQuiz to LMSService yet. I will need to do that.
            // For now assuming it exists or I will add it.
            setQuizData(data);
        } catch (err) {
            console.error(err);
            setError('Não foi possível carregar a avaliação.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qId, oId) => {
        setAnswers(prev => ({ ...prev, [qId]: oId }));
    };

    const handleSubmit = async () => {
        if (!quizData || !quizData.questions) return;

        // Validation: All questions answered?
        const unanswered = quizData.questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            alert(`Por favor, responda todas as perguntas. Faltam ${unanswered.length}.`);
            return;
        }

        try {
            const res = await LMSService.submitQuiz({
                quiz_id: quizData.quiz.id,
                answers: answers
            });
            setResult(res);
            if (res.passed && onComplete) {
                onComplete(res);
            }
        } catch (err) {
            alert('Erro ao enviar respostas.');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando avaliação...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!quizData || !quizData.quiz) return <div className="p-8 text-center text-gray-500">Nenhuma avaliação disponível para este módulo.</div>;

    // RESULT VIEW
    if (result) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
                <div className="mb-6">
                    {result.passed ? (
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">🎉</span>
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">😕</span>
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {result.passed ? 'Aprovado!' : 'Não foi dessa vez'}
                    </h2>
                    <p className="text-gray-600">
                        Sua nota: <span className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>{result.score.toFixed(0)}%</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Mínimo para aprovação: {result.min_score}%</p>
                </div>

                <div className="bg-gray-50 p-4 rounded mb-6 text-left">
                    <p className="text-sm text-gray-600 mb-1">Resumo:</p>
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span>Acertos:</span>
                        <span>{result.correct_count} de {result.total}</span>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    {!result.passed && (
                        <button
                            onClick={() => { setResult(null); setAnswers({}); }}
                            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    )}
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        {result.passed ? 'Continuar Estudos' : 'Sair'}
                    </button>
                </div>
            </div>
        );
    }

    // QUIZ FORM VIEW
    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full max-h-[80vh]">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
                <h1 className="text-xl font-bold">{quizData.quiz.title}</h1>
                <p className="text-blue-100 text-sm mt-1">
                    {quizData.quiz.description || 'Responda as perguntas abaixo para testar seu conhecimento.'}
                </p>
            </div>

            {/* Questions Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {quizData.questions.map((q, idx) => (
                    <div key={q.id} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <h3 className="font-semibold text-gray-800 mb-4 flex gap-3">
                            <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                {idx + 1}
                            </span>
                            {q.text}
                        </h3>

                        <div className="space-y-2 pl-9">
                            {q.options.map(opt => (
                                <label
                                    key={opt.id}
                                    className={`
                                        flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                        ${answers[q.id] === opt.id
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${q.id}`}
                                        value={opt.id}
                                        checked={answers[q.id] === opt.id}
                                        onChange={() => handleOptionSelect(q.id, opt.id)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-gray-700 text-sm">{opt.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                >
                    Cancelar
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                        {Object.keys(answers).length} de {quizData.questions.length} respondidas
                    </span>
                    <button
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length < quizData.questions.length}
                        className={`
                            px-8 py-2 rounded-lg font-bold shadow-md transition-all
                            ${Object.keys(answers).length < quizData.questions.length
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'}
                        `}
                    >
                        Finalizar Avaliação
                    </button>
                </div>
            </div>
        </div>
    );
}
