package DocMind.backend.Exception;

public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String message){
        super(message);
    }
    public ResourceNotFoundException(){
        super("Resource you Looking for"+
                "Cannot be Found !");
    }

    public ResourceNotFoundException(String message, Throwable ex){
        super(message,ex);
    }
}
