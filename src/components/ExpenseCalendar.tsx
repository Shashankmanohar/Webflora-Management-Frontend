import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ExpenseBackend } from "@/types/api";
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExpenseCalendarProps {
    expenses: ExpenseBackend[];
}

const ExpenseCalendar = ({ expenses }: ExpenseCalendarProps) => {
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
                                                <Badge variant="outline" className="mt-1">{exp.category}</Badge>
                                            </div>
                                            <Badge>{exp.type}</Badge>
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
