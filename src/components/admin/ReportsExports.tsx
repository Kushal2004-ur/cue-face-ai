import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Users, Target, Activity } from 'lucide-react';
import { DateRange } from 'react-day-picker';

export const ReportsExports = () => {
  const [reportType, setReportType] = useState<string>('cases');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: reportPreview } = useQuery({
    queryKey: ['report-preview', reportType, dateRange],
    queryFn: async () => {
      let query = supabase.from(reportType as any).select('*');
      
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      
      return {
        data,
        count: data?.length || 0
      };
    },
  });

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      let query = supabase.from(reportType as any).select('*');
      
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'No Data',
          description: 'No data available for the selected criteria',
          variant: 'destructive',
        });
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value).replace(/,/g, ';');
          }).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: `${data.length} records exported to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'cases': return <FileText className="h-4 w-4" />;
      case 'suspects': return <Target className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'matches': return <Activity className="h-4 w-4" />;
      case 'audit_logs': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getReportDescription = (type: string) => {
    switch (type) {
      case 'cases': return 'Export all case information including status, descriptions, and metadata';
      case 'suspects': return 'Export suspect database with photos, descriptions, and embeddings';
      case 'users': return 'Export user accounts and role assignments';
      case 'matches': return 'Export facial recognition matches with confidence scores';
      case 'audit_logs': return 'Export system audit trail and activity logs';
      default: return 'Export selected data';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Export & Reports</CardTitle>
          <CardDescription>
            Generate and export reports for analysis and compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cases">Cases Report</SelectItem>
                  <SelectItem value="suspects">Suspects Database</SelectItem>
                  <SelectItem value="matches">Matches Report</SelectItem>
                  <SelectItem value="users">Users Report</SelectItem>
                  <SelectItem value="audit_logs">Audit Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange 
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                {getReportIcon(reportType)}
                <CardTitle className="text-lg">
                  {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Preview
                </CardTitle>
              </div>
              <CardDescription>
                {getReportDescription(reportType)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportPreview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {reportPreview.count} records found
                      {dateRange?.from && (
                        <span className="ml-2">
                          from {dateRange.from.toLocaleDateString()}
                          {dateRange?.to && ` to ${dateRange.to.toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                    <Button 
                      onClick={exportToCSV}
                      disabled={isExporting || reportPreview.count === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                  </div>

                  {reportPreview.data && reportPreview.data.length > 0 && (
                    <div className="border rounded-lg p-4 bg-muted">
                      <div className="text-sm font-medium mb-2">Sample Data:</div>
                      <pre className="text-xs overflow-auto max-h-32">
                        {JSON.stringify(reportPreview.data[0], null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading preview...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setReportType('cases')}>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Cases Summary</div>
                <div className="text-sm text-muted-foreground">All case data</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setReportType('matches')}>
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Match Results</div>
                <div className="text-sm text-muted-foreground">Recognition matches</div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setReportType('audit_logs')}>
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">Activity Logs</div>
                <div className="text-sm text-muted-foreground">System audit trail</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};