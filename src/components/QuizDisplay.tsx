"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { QuizQuestionType } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, HelpCircle, Award } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuizDisplayProps {
  questions: QuizQuestionType[];
}

const QuizDisplay: FC<QuizDisplayProps> = ({ questions: initialQuestions }) => {
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      const shuffledQuestions = initialQuestions.map((q) => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5),
      }));
      setQuestions(shuffledQuestions);
    }
  }, [initialQuestions]);

  if (!initialQuestions || initialQuestions.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Nenhuma pergunta de quiz disponível.
      </p>
    );
  }

  if (questions.length === 0 && initialQuestions.length > 0) {
    return (
      <p className="text-center text-muted-foreground">Carregando quiz...</p>
    );
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = () => {
    let currentScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setQuizSubmitted(true);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    const reshuffledQuestions = initialQuestions.map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));
    setQuestions(reshuffledQuestions);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (quizSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary">
            Resultados do Quiz
          </CardTitle>
          <div className="flex justify-center items-center my-4">
            <Award className="w-16 h-16 text-yellow-500" />
          </div>
          <CardDescription className="text-xl">
            Você acertou {score} de {questions.length} perguntas!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-28rem)] md:h-[calc(100vh-30rem)] pr-4">
            <ul className="space-y-4">
              {questions.map((q, index) => (
                <li key={index} className="p-4 border rounded-lg">
                  <p className="font-semibold">
                    {index + 1}. {q.question}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      selectedAnswers[index] === q.answer
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                    Sua resposta: {selectedAnswers[index] || "Não respondida"}
                    {selectedAnswers[index] === q.answer ? (
                      <CheckCircle className="inline w-4 h-4 ml-1" />
                    ) : (
                      <XCircle className="inline w-4 h-4 ml-1" />
                    )}
                  </p>
                  {selectedAnswers[index] !== q.answer && (
                    <p className="text-sm text-green-700 mt-1">
                      Resposta correta: {q.answer}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRetakeQuiz} className="w-full">
            Refazer Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl text-primary">Hora do Quiz!</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </span>
        </div>
        <Progress value={progressValue} className="w-full h-2" />
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {currentQuestion ? (
          <div>
            <p className="text-lg font-semibold mb-4">
              {currentQuestion.question}
            </p>
            <RadioGroup
              value={selectedAnswers[currentQuestionIndex]}
              onValueChange={(value) =>
                handleAnswerSelect(currentQuestionIndex, value)
              }
              className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 px-4 border rounded-md hover:bg-secondary transition-colors cursor-pointer">
                  <RadioGroupItem
                    value={option}
                    id={`q${currentQuestionIndex}-opt${idx}`}
                    className=""
                  />
                  <Label
                    htmlFor={`q${currentQuestionIndex}-opt${idx}`}
                    className="flex-1 text-base cursor-pointer p-4">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : (
          <p>Carregando pergunta...</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          disabled={currentQuestionIndex === 0}>
          Anterior
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={() =>
              setCurrentQuestionIndex((prev) =>
                Math.min(questions.length - 1, prev + 1)
              )
            }
            disabled={!selectedAnswers[currentQuestionIndex]}>
            Próxima
          </Button>
        ) : (
          <Button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length !== questions.length}>
            Enviar Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizDisplay;
