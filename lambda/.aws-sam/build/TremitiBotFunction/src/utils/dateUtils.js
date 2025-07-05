export class DateUtils {
    static getCurrentDate() {
      return new Date().toLocaleDateString('it-IT');
    }
  
    static getTomorrowDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toLocaleDateString('it-IT');
    }
  
    static getDayAfterTomorrowDate() {
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      return dayAfter.toLocaleDateString('it-IT');
    }
  
    static processDateQuery(query) {
      return query
        .replace(/oggi/gi, this.getCurrentDate())
        .replace(/domani/gi, this.getTomorrowDate())
        .replace(/dopodomani/gi, this.getDayAfterTomorrowDate());
    }
  
    static formatItalianDate(date) {
      return new Intl.DateTimeFormat('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
  }