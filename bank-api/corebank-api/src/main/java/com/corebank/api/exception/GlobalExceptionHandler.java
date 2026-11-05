package com.corebank.api.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ApiError(int status, String message, Map<String, String> errors) {}

    // Erros lançados com ResponseStatusException (404, 409, 400...) -> devolve a mensagem no corpo
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(new ApiError(ex.getStatusCode().value(), ex.getReason(), null));
    }

    // Falha nas validações do DTO (@NotNull, @DecimalMin, @Pattern...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return build(HttpStatus.BAD_REQUEST, "Dados inválidos", errors);
    }

    // JSON malformado, data em formato errado, UUID inválido...
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "Corpo da requisição inválido ou mal formatado", null);
    }

    // Login com e-mail/senha errados
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex) {
        return build(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos", null);
    }

    // Duas operações alterando a mesma conta ao mesmo tempo (@Version da Account)
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        return build(HttpStatus.CONFLICT, "A conta foi alterada por outra operação. Tente novamente.", null);
    }

    // Violação de unicidade (e-mail/CPF duplicado em cadastros simultâneos)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleIntegrity(DataIntegrityViolationException ex) {
        return build(HttpStatus.CONFLICT, "Os dados informados conflitam com um registro existente", null);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, Map<String, String> errors) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), message, errors));
    }
}