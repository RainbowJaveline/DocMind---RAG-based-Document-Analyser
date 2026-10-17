package DocMind.backend.Exception;

public class DocumentProcessingException extends RuntimeException {

    public DocumentProcessingException(String message){
        super(message);
    }

    public DocumentProcessingException(){
        super("Error Processing Documents");
    }

    public DocumentProcessingException(String message,Throwable ex){
        super(message,ex);
    }


}
