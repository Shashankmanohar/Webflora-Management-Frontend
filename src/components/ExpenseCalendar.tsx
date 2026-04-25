import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ExpenseBackend } from "@/types/api";
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExpenseCalendarProps {
    expenses: ExpenseBackend[];
    onToggleStatus?: (id: string, currentStatus: string) => void;
}

const ExpenseCalendar = ({ expenses, onToggleStatus }: ExpenseCalendarProps) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const selectedDayExpenses = expenses.filter(exp => 
        selectedDate && isSameDay(new Date(exp.date), selectedDate)
    );

    // Custom day renderer to show a indicator if there are expenses
    const modifiers = {
        hasExpense: (date: Date) => expenses.some(exp => isSameDay(new Date(exp.date), date)),
    };

    const modifiersStyles = {
        hasExpense: {
            fontWeight: 'bold',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            color: '#3b82f6',
            border: '1px solid #3b82f6'
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Expenses for {selectedDate ? format(selectedDate, "PPP") : "Selected Date"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                        {selectedDayExpenses.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDayExpenses.map((exp) => (
                                    <div key={exp._id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-lg">₹{exp.amount}</p>
                                                <div className="flex gap-1 mt-1">
                                                    <Badge variant="outline">{exp.category}</Badge>
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={`cursor-pointer ${exp.returnStatus === "Returned" ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"}`}
                                                        onClick={() => onToggleStatus?.(exp._id, exp.returnStatus)}
                                                    >
                                                        {exp.returnStatus}
                                                    </Badge>
                                                    {exp.returnStatus === "Returned" && exp.returnDate && (
                                                        <span className="text-[10px] text-green-600 font-medium self-center">
                                                            on {format(new Date(exp.returnDate), "dd MMM")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge>{exp.type}</Badge>
                                                <Badge variant="outline" className="text-[10px]">{exp.moneySource}</Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{exp.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>By: {typeof exp.recordedBy === 'object' ? exp.recordedBy.name : 'System'}</span>
                                            {exp.recipientName && <span>• To: {exp.recipientName}</span>}
                                        </div>
                                        {exp.receiptImage && (
                                            <a 
                                                href={exp.receiptImage} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-500 hover:underline mt-2 block"
                                            >
                                                View Receipt Photo
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">
                                No expenses recorded for this day.
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpenseCalendar;
