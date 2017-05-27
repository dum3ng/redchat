(ns redchat.handlers
  (:require [immutant.web.async :as async]
            [clojure.data.json :as json]
            [compojure.core :refer :all]
            [compojure.route :as route]
            [clojure.java.io :as io]
            [taoensso.timbre :refer [info error]]
            [ring.middleware.content-type :refer [wrap-content-type]]
            [ring.middleware.resource :refer [wrap-resource]]
            [ring.middleware.not-modified :refer [wrap-not-modified]]))



(defroutes root
  (GET "/" []  {:status 200
                :headers {"Content-Type" "text/html"}
                :body (slurp (io/resource "public/index.html"))})
  (GET "/about"  [] {:status 200
                     :headers {}
                     :body "about !"})

  )


(defonce channels (atom {}))
(defn send-message
  [ch msg]
  (async/send! ch (json/write-str msg :key-fn name)))

(defmulti message-handler
  (fn [ch data] (:type data)))


(defmethod message-handler "join"
  message-join
  #_ "data is {:type \"join\" :payload {:username <name>}}"
  [ch data]
  (let [name  (-> data :payload :username)]
    (if ((keys @channels) name)
      (send-message ch {:type "join"
                        :data {:message "User exists. Try another"}})
      (do
        (info :join (format "%s has joined." name))
        (swap! channels assoc  name ch))))
  )


(defmethod message-handler "chat"
  #_ "data is {:type \"chat\" :payload {:message <msg>
:to <name> :from <name>}}"
  [ch data]
  (let [payload (:payload data)
        {:keys [message from to]} payload
        to-ch (@channels to)]
    (if to-ch
      (send-message to-ch {:type "chat"
                           :data {:from from
                                  :message message}})
      #_ (error (format "user %s not onlin." to))
      (send-message  (@channels from) {:type "error"
                                       :data {:message (format "user %s now NOT online." to)}}))))

(defn close-handler
  [ch _]
  (if-let [[name _] (first (drop-while (fn [[k v]] (not= ch v))
                                       @channels))]
    (do
      (info (format "%s has disconnected." name))
      (swap! channels dissoc name))))

(def ws {:on-open (fn [ch] (send-message ch {:type "server"
                                            :data "connected."}))
         :on-close close-handler
         :on-message (fn [ch msg]
                       (let [data (try (json/read-str msg :key-fn keyword)
                                       (catch Exception ex
                                         msg))]
                         (info (:type data))
                         (if (string? data)
                           (error "Message malformed.")
                           (message-handler ch data)))
                       )})


(defn ws-handler [req]
  (if (:websocket? req)
    (async/as-channel req ws)
    {:status 404
     :body "not found.. should be websocket"}))



(defroutes websocket
  (GET "/ws" request (ws-handler request)))

(defroutes app-base
  root
  websocket
  )

(def app (-> app-base
             (wrap-resource "public")
             wrap-content-type
             wrap-not-modified))
(defn heroku
  [request]
  {:status 200
   :headers {}
   :body "hello heroku!"})
